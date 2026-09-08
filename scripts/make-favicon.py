"""Rasterize the F/R mark into PNG and ICO favicons."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ROOT = PROJECT_ROOT / "public"
ACID = (216, 255, 62, 255)
INK = (11, 13, 12, 255)

# The clipped-corner tile mirrors the technical corner marks used throughout
# the portfolio. At favicon size it gives the mark a stronger silhouette than
# a generic full square, while keeping almost the whole canvas available.
BADGE = [(0.0, 0.0), (27.0, 0.0), (32.0, 5.0), (32.0, 32.0), (5.0, 32.0), (0.0, 27.0)]

# Matching public/favicon.svg, 32-unit design space, even-odd fill.
PATHS = [
    # F
    [
        (2.5, 2.5),
        (14.5, 2.5),
        (14.5, 7.1),
        (7.0, 7.1),
        (7.0, 12.5),
        (13.0, 12.5),
        (13.0, 17.1),
        (7.0, 17.1),
        (7.0, 29.5),
        (2.5, 29.5),
    ],
    # slash
    [(14.2, 29.5), (18.4, 2.5), (21.0, 2.5), (16.8, 29.5)],
    # R outer
    [
        (20.2, 2.5),
        (26.7, 2.5),
        (29.7, 5.3),
        (29.7, 13.3),
        (27.5, 15.8),
        (29.8, 29.5),
        (25.7, 29.5),
        (24.1, 19.0),
        (24.1, 29.5),
        (20.2, 29.5),
    ],
    # R counter (even-odd hole)
    [
        (24.1, 7.0),
        (26.0, 7.0),
        (26.7, 7.7),
        (26.7, 11.7),
        (26.0, 12.5),
        (24.1, 12.5),
    ],
]


def even_odd(x: float, y: float, poly: list[tuple[float, float]]) -> bool:
    inside = False
    j = len(poly) - 1
    for i, (xi, yi) in enumerate(poly):
        xj, yj = poly[j]
        if (yi > y) != (yj > y):
            t = (y - yi) / (yj - yi + 1e-12)
            if x < xi + t * (xj - xi):
                inside = not inside
        j = i
    return inside


def sample(u: float, v: float) -> tuple[int, int, int, int]:
    if not even_odd(u, v, BADGE):
        return INK

    hits = 0
    for poly in PATHS:
        if even_odd(u, v, poly):
            hits += 1
    return INK if hits % 2 == 1 else ACID


def png_bytes(size: int, samples: int = 4) -> bytes:
    rows: list[bytes] = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            r = g = b = a = 0
            for oy in range(samples):
                for ox in range(samples):
                    u = (x + (ox + 0.5) / samples) * 32 / size
                    v = (y + (oy + 0.5) / samples) * 32 / size
                    pr, pg, pb, pa = sample(u, v)
                    r += pr
                    g += pg
                    b += pb
                    a += pa
            n = samples * samples
            row.extend((r // n, g // n, b // n, a // n))
        rows.append(b"\x00" + bytes(row))

    raw = b"".join(rows)

    def chunk(tag: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)

    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def ico_from_pngs(images: list[tuple[int, bytes]]) -> bytes:
    offset = 6 + 16 * len(images)
    entries: list[bytes] = []
    payloads: list[bytes] = []
    for size, png in images:
        entries.append(
            struct.pack(
                "<BBBBHHII",
                size if size < 256 else 0,
                size if size < 256 else 0,
                0,
                0,
                1,
                32,
                len(png),
                offset,
            )
        )
        payloads.append(png)
        offset += len(png)
    return struct.pack("<HHH", 0, 1, len(images)) + b"".join(entries) + b"".join(payloads)


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    assets = {
        "favicon-16.png": 16,
        "favicon-32.png": 32,
        "favicon-48.png": 48,
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }
    for name, size in assets.items():
        (ROOT / name).write_bytes(png_bytes(size, samples=5 if size <= 48 else 3))
        print(f"wrote {name}")

    ico = ico_from_pngs(
        [
            (16, (ROOT / "favicon-16.png").read_bytes()),
            (32, (ROOT / "favicon-32.png").read_bytes()),
            (48, (ROOT / "favicon-48.png").read_bytes()),
        ]
    )
    (ROOT / "favicon.ico").write_bytes(ico)
    print("wrote favicon.ico")



if __name__ == "__main__":
    main()
