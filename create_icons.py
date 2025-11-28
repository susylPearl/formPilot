#!/usr/bin/env python3
"""Create simple valid PNG icon files"""
import struct
import zlib

def create_simple_png(width, height, r=102, g=126, b=234):
    """Create a minimal valid PNG with solid color"""
    def write_chunk(data, chunk_type):
        chunk = struct.pack('>I', len(data)) + chunk_type + data
        crc = zlib.crc32(chunk_type + data) & 0xffffffff
        chunk += struct.pack('>I', crc)
        return chunk
    
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    png += write_chunk(ihdr_data, b'IHDR')
    
    # IDAT chunk - create image data
    scanline = bytes([0] + [r, g, b] * width)
    image_data = scanline * height
    compressed = zlib.compress(image_data, 9)
    png += write_chunk(compressed, b'IDAT')
    
    # IEND chunk
    png += write_chunk(b'', b'IEND')
    
    return png

# Create icons
sizes = [16, 48, 128]
for size in sizes:
    png_data = create_simple_png(size, size)
    with open(f'icons/icon{size}.png', 'wb') as f:
        f.write(png_data)
    print(f'Created icons/icon{size}.png')
