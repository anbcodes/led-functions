// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
export const hsv2rgb = (h: number, s: number, v: number) => {
  var r = 0
  var g = 0
  var b = 0
  var i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}

// // https://github.com/FastLED/FastLED/blob/master/src/hsv2rgb.cpp
 
// const APPLY_DIMMING = (x: number) => (x)
// const HSV_SECTION_6 = (0x20)
// const HSV_SECTION_3 = (0x40)

// export const hsv2rgb = (h: number, s: number, v: number) => {
//  // Convert hue, saturation and brightness ( HSV/HSB ) to RGB
//     // "Dimming" is used on saturation and brightness to make
//     // the output more visually linear.

//     // Apply dimming curves
//     let value = APPLY_DIMMING( v );
//     let saturation = s;

//     // The brightness floor is minimum number that all of
//     // R, G, and B will be set to.
//     let invsat = APPLY_DIMMING( 255 - saturation);
//     let brightness_floor = (value * invsat) / 256;

//     // The color amplitude is the maximum amount of R, G, and B
//     // that will be added on top of the brightness_floor to
//     // create the specific hue desired.
//     let color_amplitude = value - brightness_floor;

//     // Figure out which section of the hue wheel we're in,
//     // and how far offset we are withing that section
//     let section = h / HSV_SECTION_3; // 0..2
//     let offset = h % HSV_SECTION_3;  // 0..63

//     let rampup = offset; // 0..63
//     let rampdown = (HSV_SECTION_3 - 1) - offset; // 63..0

//     // We now scale rampup and rampdown to a 0-255 range -- at least
//     // in theory, but here's where architecture-specific decsions
//     // come in to play:
//     // To scale them up to 0-255, we'd want to multiply by 4.
//     // But in the very next step, we multiply the ramps by other
//     // values and then divide the resulting product by 256.
//     // So which is faster?
//     //   ((ramp * 4) * othervalue) / 256
//     // or
//     //   ((ramp    ) * othervalue) /  64
//     // It depends on your processor architecture.
//     // On 8-bit AVR, the "/ 256" is just a one-cycle register move,
//     // but the "/ 64" might be a multicycle shift process. So on AVR
//     // it's faster do multiply the ramp values by four, and then
//     // divide by 256.
//     // On ARM, the "/ 256" and "/ 64" are one cycle each, so it's
//     // faster to NOT multiply the ramp values by four, and just to
//     // divide the resulting product by 64 (instead of 256).
//     // Moral of the story: trust your profiler, not your insticts.

//     // Since there's an AVR assembly version elsewhere, we'll
//     // assume what we're on an architecture where any number of
//     // bit shifts has roughly the same cost, and we'll remove the
//     // redundant math at the source level:

//     //  // scale up to 255 range
//     //  //rampup *= 4; // 0..252
//     //  //rampdown *= 4; // 0..252

//     // compute color-amplitude-scaled-down versions of rampup and rampdown
//     let rampup_amp_adj   = (rampup   * color_amplitude) / (256 / 4);
//     let rampdown_amp_adj = (rampdown * color_amplitude) / (256 / 4);

//     // add brightness_floor offset to everything
//     let rampup_adj_with_floor   = rampup_amp_adj   + brightness_floor;
//     let rampdown_adj_with_floor = rampdown_amp_adj + brightness_floor;

//     const rgb = {
//       r: 0,
//       g: 0,
//       b: 0,
//     }

//     if( section ) {
//         if( section == 1) {
//             // section 1: 0x40..0x7F
//             rgb.r = brightness_floor;
//             rgb.g = rampdown_adj_with_floor;
//             rgb.b = rampup_adj_with_floor;
//         } else {
//             // section 2; 0x80..0xBF
//             rgb.r = rampup_adj_with_floor;
//             rgb.g = brightness_floor;
//             rgb.b = rampdown_adj_with_floor;
//         }
//     } else {
//         // section 0: 0x00..0x3F
//         rgb.r = rampdown_adj_with_floor;
//         rgb.g = rampup_adj_with_floor;
//         rgb.b = brightness_floor;
//     }

//     return rgb;
//   }