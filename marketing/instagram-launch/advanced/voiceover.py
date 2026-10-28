"""Generate timed neural narration and word boundaries for the studio edit.

Run with the edge-tts environment; see README.md. Only the public ad script is sent.
"""
import asyncio
import json
import pathlib
import subprocess
import edge_tts

HERE = pathlib.Path(__file__).resolve().parent
ASSETS = HERE / 'assets'
ASSETS.mkdir(parents=True, exist_ok=True)
DURATION = 104 / 3
VOICE = 'en-US-AndrewNeural'
CLIPS = [
    {'start': .28, 'end': 3.02, 'text': 'Still paying too much for software?'},
    {'start': 3.48, 'end': 6.16, 'text': 'Meet SaaS Folio. Spend smarter.'},
    {'start': 6.72, 'end': 10.98, 'text': 'Search tools by brand or category. Find your fit.'},
    {'start': 11.52, 'end': 15.80, 'text': 'Explore coupons, trials and annual savings, with clear terms.'},
    {'start': 16.34, 'end': 21.04, 'text': 'Compare features, pricing, and alternatives. Side by side.'},
    {'start': 21.68, 'end': 26.98, 'text': 'Compare monthly and annual costs, with fees included, before you commit.'},
    {'start': 27.28, 'end': 29.30, 'text': 'Good software, better prices.'},
    {'start': 29.66, 'end': 34.23, 'text': 'Visit SaaS Folio dot tech. Follow for smarter software.'},
]

def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout

def timestamp(seconds):
    ms = round(seconds * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'

async def generate(index, clip, semaphore):
    async with semaphore:
        media = ASSETS / f'voice-{index + 1:02}.mp3'
        metadata = ASSETS / f'voice-{index + 1:02}.json'
        cache_key = ASSETS / f'voice-{index + 1:02}.txt'
        expected = VOICE + '\n-4%\n-2Hz\n' + clip['text']
        if media.exists() and metadata.exists() and cache_key.exists() and cache_key.read_text() == expected:
            words = json.loads(metadata.read_text())
        else:
            last_error = None
            for attempt in range(3):
                try:
                    communicate = edge_tts.Communicate(clip['text'], VOICE, rate='-4%', pitch='-2Hz', boundary='WordBoundary')
                    words = []
                    with media.open('wb') as output:
                        async for chunk in communicate.stream():
                            if chunk['type'] == 'audio':
                                output.write(chunk['data'])
                            elif chunk['type'] == 'WordBoundary':
                                words.append({'word': chunk['text'], 'start': chunk['offset'] / 1e7, 'end': (chunk['offset'] + chunk['duration']) / 1e7})
                    metadata.write_text(json.dumps(words, indent=2))
                    cache_key.write_text(expected)
                    break
                except Exception as error:
                    last_error = error
                    await asyncio.sleep(1 + attempt)
            else:
                raise last_error
        length = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(media)]))
        available = clip['end'] - clip['start']
        # Avoid any phrase crossing a picture cut. Most phrases need no adjustment.
        speed = max(1, length / available)
        if speed > 1.16:
            raise RuntimeError(f'Clip {index + 1} would sound rushed ({speed:.2f}); shorten the script.')
        wave = ASSETS / f'voice-{index + 1:02}.wav'
        run(['ffmpeg', '-v', 'error', '-y', '-i', str(media), '-af', f'atempo={speed:.8f},highpass=f=85,lowpass=f=12000,afade=t=in:d=0.012,afade=t=out:st={max(.1, length / speed - .04):.8f}:d=0.04', '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', str(wave)])
        adjusted = [{'word': w['word'], 'start': clip['start'] + w['start'] / speed, 'end': clip['start'] + w['end'] / speed} for w in words]
        print(f'Voice {index + 1}: {length:.2f}s, tempo {speed:.3f}, starts {clip["start"]:.2f}s', flush=True)
        return adjusted

async def main():
    semaphore = asyncio.Semaphore(2)
    results = await asyncio.gather(*(generate(i, clip, semaphore) for i, clip in enumerate(CLIPS)))
    words = [w for result in results for w in result]
    (ASSETS / 'narration-words.json').write_text(json.dumps(words, indent=2))
    (ASSETS / 'narration-words.js').write_text('window.NARRATION_WORDS=' + json.dumps(words) + ';\n')
    args = ['ffmpeg', '-hide_banner', '-v', 'error', '-y']
    for i in range(len(CLIPS)):
        args += ['-i', str(ASSETS / f'voice-{i + 1:02}.wav')]
    filters = [f'[{i}:a]adelay={round(clip["start"] * 1000)}:all=1[v{i}]' for i, clip in enumerate(CLIPS)]
    filters += [''.join(f'[v{i}]' for i in range(len(CLIPS))) + f'amix=inputs={len(CLIPS)}:normalize=0,apad,atrim=duration={DURATION},equalizer=f=2800:t=q:w=1:g=1.5,acompressor=threshold=0.12:ratio=2:attack=5:release=90:makeup=1.2,loudnorm=I=-16:TP=-3.5:LRA=6,aresample=48000[voice]']
    args += ['-filter_complex', ';'.join(filters), '-map', '[voice]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', str(ASSETS / 'narration.wav')]
    run(args)
    cues = []
    for clip in CLIPS:
        cues.append(f'{len(cues)+1}\n{timestamp(clip["start"])} --> {timestamp(clip["end"])}\n{clip["text"].replace("SaaS Folio", "SaaSFolio").replace("A I", "AI")}\n')
    (HERE / 'exports').mkdir(exist_ok=True)
    (HERE / 'exports' / 'saasfolio-studio-subtitles.srt').write_text('\n'.join(cues))
    (HERE / 'voiceover-script.txt').write_text('\n\n'.join(clip['text'].replace('SaaS Folio', 'SaaSFolio').replace('A I', 'AI') for clip in CLIPS) + '\n')
    print('Timed narration and word-synced caption metadata ready.', flush=True)

asyncio.run(main())
