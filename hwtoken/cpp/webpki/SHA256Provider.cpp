/* ====================================================================
 * Copyright (c) 1998-2010 The OpenSSL Project.  All rights reserved.
 *
 * This product includes cryptographic software written by Eric Young
 * (eay@cryptsoft.com).  This product includes software written by Tim
 * Hudson (tjh@cryptsoft.com).
 *
 * ====================================================================
 * C++ adoption was made by Anders Rundgren (anders.rundgren@telia.com)
 * ====================================================================
 */

#include <string.h>
#include <stdlib.h>

#include "crypto.h"

#include "_shacommon.h"

/*
 * FIPS specification refers to right rotations, while our ROTATE macro
 * is left one. This is why you might notice that rotation coefficients
 * differ from those observed in FIPS document by 32-N...
 */
#define Sigma0(x)   (ROTATE((x),30) ^ ROTATE((x),19) ^ ROTATE((x),10))
#define Sigma1(x)   (ROTATE((x),26) ^ ROTATE((x),21) ^ ROTATE((x),7))
#define sigma0(x)   (ROTATE((x),25) ^ ROTATE((x),14) ^ ((x)>>3))
#define sigma1(x)   (ROTATE((x),15) ^ ROTATE((x),13) ^ ((x)>>10))

#define Ch(x,y,z)   (((x) & (y)) ^ ((~(x)) & (z)))
#define Maj(x,y,z)  (((x) & (y)) ^ ((x) & (z)) ^ ((y) & (z)))

#define ROUND_00_15(i,a,b,c,d,e,f,g,h)      do {    \
    T1 += h + Sigma1(e) + Ch(e,f,g) + K256[i];  \
    h = Sigma0(a) + Maj(a,b,c);         \
    d += T1;    h += T1;        } while (0)

#define ROUND_16_63(i,a,b,c,d,e,f,g,h,X)    do {    \
    s0 = X[(i+1) & 0x0f]; s0 = sigma0(s0);    \
    s1 = X[(i+14) & 0x0f]; s1 = sigma1(s1);    \
    T1 = X[(i) & 0x0f] += s0 + s1 + X[(i+9) & 0x0f];    \
    ROUND_00_15(i,a,b,c,d,e,f,g,h);     } while (0)

static const CRYPTO_U32 K256[64] =
  {
    0x428a2f98UL,0x71374491UL,0xb5c0fbcfUL,0xe9b5dba5UL,
    0x3956c25bUL,0x59f111f1UL,0x923f82a4UL,0xab1c5ed5UL,
    0xd807aa98UL,0x12835b01UL,0x243185beUL,0x550c7dc3UL,
    0x72be5d74UL,0x80deb1feUL,0x9bdc06a7UL,0xc19bf174UL,
    0xe49b69c1UL,0xefbe4786UL,0x0fc19dc6UL,0x240ca1ccUL,
    0x2de92c6fUL,0x4a7484aaUL,0x5cb0a9dcUL,0x76f988daUL,
    0x983e5152UL,0xa831c66dUL,0xb00327c8UL,0xbf597fc7UL,
    0xc6e00bf3UL,0xd5a79147UL,0x06ca6351UL,0x14292967UL,
    0x27b70a85UL,0x2e1b2138UL,0x4d2c6dfcUL,0x53380d13UL,
    0x650a7354UL,0x766a0abbUL,0x81c2c92eUL,0x92722c85UL,
    0xa2bfe8a1UL,0xa81a664bUL,0xc24b8b70UL,0xc76c51a3UL,
    0xd192e819UL,0xd6990624UL,0xf40e3585UL,0x106aa070UL,
    0x19a4c116UL,0x1e376c08UL,0x2748774cUL,0x34b0bcb5UL,
    0x391c0cb3UL,0x4ed8aa4aUL,0x5b9cca4fUL,0x682e6ff3UL,
    0x748f82eeUL,0x78a5636fUL,0x84c87814UL,0x8cc70208UL,
    0x90befffaUL,0xa4506cebUL,0xbef9a3f7UL,0xc67178f2UL
  };


namespace webpki
{

const int SHA256Provider::DIGEST_LENGTH;


SHA256Provider::SHA256Provider ()
  {
    _init ();
  }


void SHA256Provider::_init ()
  {
    m_error = NULL;
	m_needs_init = false;
    m_sha_ctx.h[0] = 0x6a09e667UL;   m_sha_ctx.h[1] = 0xbb67ae85UL;
    m_sha_ctx.h[2] = 0x3c6ef372UL;   m_sha_ctx.h[3] = 0xa54ff53aUL;
    m_sha_ctx.h[4] = 0x510e527fUL;   m_sha_ctx.h[5] = 0x9b05688cUL;
    m_sha_ctx.h[6] = 0x1f83d9abUL;   m_sha_ctx.h[7] = 0x5be0cd19UL;
    m_sha_ctx.Nl = 0;
    m_sha_ctx.Nh = 0;
    m_sha_ctx.num = 0;
	m_sha_ctx.digest_length = DIGEST_LENGTH;
  }


void SHA256Provider::hash_block_data_order (const unsigned char* data, int num)
  {
    CRYPTO_U32 a, b, c, d, e, f, g, h, s0, s1, T1;
    CRYPTO_U32 X[16];
    int i;
    const union { long one; char little; } is_endian = {1};

    while (num--)
      {
        a = m_sha_ctx.h[0];  b = m_sha_ctx.h[1];  c = m_sha_ctx.h[2];  d = m_sha_ctx.h[3];
        e = m_sha_ctx.h[4];  f = m_sha_ctx.h[5];  g = m_sha_ctx.h[6];  h = m_sha_ctx.h[7];

        if (!is_endian.little && sizeof(CRYPTO_U32)==4 && ((size_t)data%4)==0)
          {
            const CRYPTO_U32 *W=(const CRYPTO_U32 *)data;

            T1 = X[0] = W[0];   ROUND_00_15(0,a,b,c,d,e,f,g,h);
            T1 = X[1] = W[1];   ROUND_00_15(1,h,a,b,c,d,e,f,g);
            T1 = X[2] = W[2];   ROUND_00_15(2,g,h,a,b,c,d,e,f);
            T1 = X[3] = W[3];   ROUND_00_15(3,f,g,h,a,b,c,d,e);
            T1 = X[4] = W[4];   ROUND_00_15(4,e,f,g,h,a,b,c,d);
            T1 = X[5] = W[5];   ROUND_00_15(5,d,e,f,g,h,a,b,c);
            T1 = X[6] = W[6];   ROUND_00_15(6,c,d,e,f,g,h,a,b);
            T1 = X[7] = W[7];   ROUND_00_15(7,b,c,d,e,f,g,h,a);
            T1 = X[8] = W[8];   ROUND_00_15(8,a,b,c,d,e,f,g,h);
            T1 = X[9] = W[9];   ROUND_00_15(9,h,a,b,c,d,e,f,g);
            T1 = X[10] = W[10]; ROUND_00_15(10,g,h,a,b,c,d,e,f);
            T1 = X[11] = W[11]; ROUND_00_15(11,f,g,h,a,b,c,d,e);
            T1 = X[12] = W[12]; ROUND_00_15(12,e,f,g,h,a,b,c,d);
            T1 = X[13] = W[13]; ROUND_00_15(13,d,e,f,g,h,a,b,c);
            T1 = X[14] = W[14]; ROUND_00_15(14,c,d,e,f,g,h,a,b);
            T1 = X[15] = W[15]; ROUND_00_15(15,b,c,d,e,f,g,h,a);

            data += SHA_CBLOCK;
          }
        else
          {
            CRYPTO_U32 l;

            HOST_c2l(data,l); T1 = X[0] = l;  ROUND_00_15(0,a,b,c,d,e,f,g,h);
            HOST_c2l(data,l); T1 = X[1] = l;  ROUND_00_15(1,h,a,b,c,d,e,f,g);
            HOST_c2l(data,l); T1 = X[2] = l;  ROUND_00_15(2,g,h,a,b,c,d,e,f);
            HOST_c2l(data,l); T1 = X[3] = l;  ROUND_00_15(3,f,g,h,a,b,c,d,e);
            HOST_c2l(data,l); T1 = X[4] = l;  ROUND_00_15(4,e,f,g,h,a,b,c,d);
            HOST_c2l(data,l); T1 = X[5] = l;  ROUND_00_15(5,d,e,f,g,h,a,b,c);
            HOST_c2l(data,l); T1 = X[6] = l;  ROUND_00_15(6,c,d,e,f,g,h,a,b);
            HOST_c2l(data,l); T1 = X[7] = l;  ROUND_00_15(7,b,c,d,e,f,g,h,a);
            HOST_c2l(data,l); T1 = X[8] = l;  ROUND_00_15(8,a,b,c,d,e,f,g,h);
            HOST_c2l(data,l); T1 = X[9] = l;  ROUND_00_15(9,h,a,b,c,d,e,f,g);
            HOST_c2l(data,l); T1 = X[10] = l; ROUND_00_15(10,g,h,a,b,c,d,e,f);
            HOST_c2l(data,l); T1 = X[11] = l; ROUND_00_15(11,f,g,h,a,b,c,d,e);
            HOST_c2l(data,l); T1 = X[12] = l; ROUND_00_15(12,e,f,g,h,a,b,c,d);
            HOST_c2l(data,l); T1 = X[13] = l; ROUND_00_15(13,d,e,f,g,h,a,b,c);
            HOST_c2l(data,l); T1 = X[14] = l; ROUND_00_15(14,c,d,e,f,g,h,a,b);
            HOST_c2l(data,l); T1 = X[15] = l; ROUND_00_15(15,b,c,d,e,f,g,h,a);
          }

        for (i=16;i<64;i+=8)
          {
            ROUND_16_63(i+0,a,b,c,d,e,f,g,h,X);
            ROUND_16_63(i+1,h,a,b,c,d,e,f,g,X);
            ROUND_16_63(i+2,g,h,a,b,c,d,e,f,X);
            ROUND_16_63(i+3,f,g,h,a,b,c,d,e,X);
            ROUND_16_63(i+4,e,f,g,h,a,b,c,d,X);
            ROUND_16_63(i+5,d,e,f,g,h,a,b,c,X);
            ROUND_16_63(i+6,c,d,e,f,g,h,a,b,X);
            ROUND_16_63(i+7,b,c,d,e,f,g,h,a,X);
          }

        m_sha_ctx.h[0] += a; m_sha_ctx.h[1] += b; m_sha_ctx.h[2] += c; m_sha_ctx.h[3] += d;
        m_sha_ctx.h[4] += e; m_sha_ctx.h[5] += f; m_sha_ctx.h[6] += g; m_sha_ctx.h[7] += h;
      }
  }


}
