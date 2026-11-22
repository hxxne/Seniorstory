"""MediMove 로고 파일을 만듭니다.

    python build.py

기호(M)는 SVG와 PNG로, 글자가 붙은 로고는 PNG로 나옵니다. PNG는 배경이 투명합니다.
크롬이나 엣지가 필요하고, 글자(Nunito)를 받아 오려면 인터넷이 연결되어 있어야 합니다.
"""
import os, subprocess, sys, tempfile, pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent
BROWSERS = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
]
RED, GOLD, BLACK, WHITE = '#9E161C', '#C39D5E', '#14171A', '#FFFFFF'
TONES = {'컬러': ('color', RED, GOLD), '검정': ('black', BLACK, BLACK), '빨강': ('red', RED, RED), '흰색': ('white', WHITE, WHITE)}
M = 'M0,0 H30 L67.2,38.7 L104.4,0 H134.4 V100 H102.4 V48.2 L67.2,83.4 L32,48.2 V100 H0 Z'
CHECK = 'M104.4,12.4 H122.1 V28.5 L67.2,83.4 L48.9,65.1 Z'


def mark_svg(a, b):
    mono = a == b
    gap = (
        '<defs><mask id="gap" maskUnits="userSpaceOnUse" x="-1" y="-1" width="136.4" height="102">'
        '<rect x="-1" y="-1" width="136.4" height="102" fill="#fff"/>'
        f'<path d="{CHECK}" fill="#000" stroke="#000" stroke-width="8" stroke-linejoin="round"/></mask></defs>'
        if mono
        else ''
    )
    masked = ' mask="url(#gap)"' if mono else ''
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 136.4 102" width="682" height="510">'
        f'{gap}<path d="{M}" fill="{a}" stroke="{a}" stroke-width="2" stroke-linejoin="round"{masked}/>'
        f'<path d="{CHECK}" fill="{b}" stroke="{b}" stroke-width="2" stroke-linejoin="round"/></svg>\n'
    )


def main():
    browser = next((b for b in BROWSERS if os.path.exists(b)), None)
    if not browser:
        sys.exit('크롬이나 엣지를 찾지 못했습니다')
    page = (HERE / 'logo.html').as_uri()
    profile = tempfile.mkdtemp(prefix='mm-logo-')
    for name, (v, a, b) in TONES.items():
        (OUT / f'MediMove 기호 - {name}.svg').write_text(mark_svg(a, b), encoding='utf-8')
        for kind, label, size in (('logo', '로고', '2400,640'), ('mark', '기호', '1200,1000')):
            target = OUT / f'MediMove {label} - {name}.png'
            subprocess.run(
                [browser, '--headless=new', f'--user-data-dir={profile}', '--hide-scrollbars', '--force-device-scale-factor=1',
                 f'--window-size={size}', '--default-background-color=00000000', '--virtual-time-budget=15000',
                 f'--screenshot={target}', f'{page}?v={v}&kind={kind}'],
                check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120,
            )
            print(target.name, target.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
