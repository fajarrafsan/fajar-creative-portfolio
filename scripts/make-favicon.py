"""Rasterize the F/R mark into PNG and ICO favicons."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public"
ACID = (216, 255, 62, 255)
INK = (11, 13, 12, 255)

# Matching public/favicon.svg, 32-unit design space, even-odd fill.
PATHS = [
    # F
    [
        (3.6, 6.4),
        (14.7, 6.4),
        (14.7, 10.0),
        (7.4, 10.0),
        (7.4, 13.3),
        (13.5, 13.3),
        (13.5, 16.8),
        (7.4, 16.8),
        (7.4, 25.6),
        (3.6, 25.6),
    ],
    # slash
    [(15.4, 25.6), (18.3, 6.4), (20.8, 6.4), (17.9, 25.6)],
    # R outer
    [
        (21.5, 6.4),
        (27.7, 6.4),
        (29.6, 6.8),
        (31.3, 8.6),
        (31.3, 11.4),
        (29.85, 13.15),
        (31.2, 25.6),
        (27.85, 25.6),
        (24.9, 17.55),
        (23.5, 17.55),
        (23.5, 25.6),
        (21.5, 25.6),
    ],
    # R counter (even-odd hole)
    [
        (24.3, 9.85),
        (26.75, 9.85),
        (27.45, 10.15),
        (27.45, 12.85),
        (26.75, 13.4),
        (24.3, 13.4),
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


def ico_from_png(png: bytes, size: int) -> bytes:
    entry = struct.pack(
        "<BBBBHHII",
        size if size < 256 else 0,
        size if size < 256 else 0,
        0,
        0,
        1,
        32,
        len(png),
        22,
    )
    return struct.pack("<HHH", 0, 1, 1) + entry + png


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    assets = {
        "favicon-32.png": 32,
        "favicon-48.png": 48,
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }
    for name, size in assets.items():
        (ROOT / name).write_bytes(png_bytes(size, samples=5 if size <= 48 else 3))
        print(f"wrote {name}")

    png32 = (ROOT / "favicon-32.png").read_bytes()
    (ROOT / "favicon.ico").write_bytes(ico_from_png(png32, 32))
    print("wrote favicon.ico")


if __name__ == "__main__":
    main()
