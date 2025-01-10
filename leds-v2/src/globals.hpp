#pragma once

#include <FastLED.h>

#define LED_COUNT 238
#define RENDER_LED_COUNT 238
#define RENDER_LED_OFFSET 0

#define DATA_PIN 8

#define GLOBAL_OFFSET -7000
#define GLOBAL_SPEED_DIVISOR 1000

CRGB leds[LED_COUNT];
// uint8_t leds[LED_COUNT][3];
