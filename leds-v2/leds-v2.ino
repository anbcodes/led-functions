// clang-format off
#include <FastLED.h>
#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoOTA.h>
// clang-format on

#include "src/globals.hpp"
#include "src/secrets.hpp"

CRGB color = CRGB(0, 0, 255);

const uint32_t sin_lookup[] = {
    128, 131, 134, 137, 140, 143, 146, 149, 152, 156, 159, 162, 165, 168, 171,
    174, 176, 179, 182, 185, 188, 191, 193, 196, 199, 201, 204, 206, 209, 211,
    213, 216, 218, 220, 222, 224, 226, 228, 230, 232, 234, 235, 237, 239, 240,
    242, 243, 244, 246, 247, 248, 249, 250, 251, 251, 252, 253, 253, 254, 254,
    254, 255, 255, 255, 255, 255, 255, 255, 254, 254, 253, 253, 252, 252, 251,
    250, 249, 248, 247, 246, 245, 244, 242, 241, 239, 238, 236, 235, 233, 231,
    229, 227, 225, 223, 221, 219, 217, 215, 212, 210, 207, 205, 202, 200, 197,
    195, 192, 189, 186, 184, 181, 178, 175, 172, 169, 166, 163, 160, 157, 154,
    151, 148, 145, 142, 138, 135, 132, 129, 126, 123, 120, 117, 113, 110, 107,
    104, 101, 98,  95,  92,  89,  86,  83,  80,  77,  74,  71,  69,  66,  63,
    60,  58,  55,  53,  50,  48,  45,  43,  40,  38,  36,  34,  32,  30,  28,
    26,  24,  22,  20,  19,  17,  16,  14,  13,  11,  10,  9,   8,   7,   6,
    5,   4,   3,   3,   2,   2,   1,   1,   0,   0,   0,   0,   0,   0,   0,
    1,   1,   1,   2,   2,   3,   4,   4,   5,   6,   7,   8,   9,   11,  12,
    13,  15,  16,  18,  20,  21,  23,  25,  27,  29,  31,  33,  35,  37,  39,
    42,  44,  46,  49,  51,  54,  56,  59,  62,  64,  67,  70,  73,  76,  79,
    81,  84,  87,  90,  93,  96,  99,  103, 106, 109, 112, 115, 118, 121, 124};

void connect() {
  Serial.begin(9600);
  // delay(3000);
  leds[0] = CRGB(1, 1, 1);
  FastLED.setBrightness(255);
  FastLED.show();

  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    leds[0] = CRGB(1, 0, 0);
    FastLED.show();
    while (1)
      ;
  }

  arduino::String fv = WiFi.firmwareVersion();

  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
    Serial.println(WIFI_FIRMWARE_LATEST_VERSION);
    leds[0] = CRGB(1, 0, 0);
    FastLED.show();
  }

  int attempts = 0;

  int status = 0;

  while (status != WL_CONNECTED) {
    digitalWrite(LED_BUILTIN, LOW);
    Serial.print("Attempting to connect to SSID: ");

    Serial.println(WIFI_SSID);

    status = WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    if (status == WL_CONNECTED) {
      break;
    }

    Serial.println(status);

    delay(4000);
    attempts++;
    if (attempts > 10) {
      NVIC_SystemReset();
    }
  }

  leds[0] = CRGB(1, 0, 1);
  FastLED.show();
}

WiFiServer server(11234);
WiFiServer httpServer(80);
WiFiServer websockets(11235);

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, LED_COUNT);
  pinMode(LED_BUILTIN, OUTPUT);
  connect();
  ArduinoOTA.begin(WiFi.localIP(), "LED", "LEDS1234", InternalStorage);
  server.begin();
}

const int PROGRAM_SIZE = 1000;

enum Commands {
  INVALID = 0,
  SIN,
  ADD,
  SUB,
  MUL,
  DIV,
  POW,
  MOD,
  IF,
  EQ,
  GT,
  LT,
  AND,
  OR,
  VAL,
  VAR_T,
  VAR_I,
  END,
};

// Suffix programs ====================

// clang-format off
uint32_t program_h[PROGRAM_SIZE] = {
                VAR_T,  // [5]
                // VAL, 5, // [5, t]
            // DIV,        // [5/t]
            VAR_I,      // [5/t, i]
        ADD,            // [5/t+i]
        VAL, 5,         // [5/t+i, 5]
    MUL,                 // [(5/t + i) * 5]
    END,
};
// uint32_t program_h[PROGRAM_SIZE] = {
//     VAL, 0,
//     END,
// };

// (t/speed + i) * seg_size

// uint32_t program_h[PROGRAM_SIZE] = {
//     VAL, 5,
//     VAL, 5,
//     RAINBOW,
// };

uint32_t program_s[PROGRAM_SIZE] = {
    VAL,
    255,
    END,
};

// (i * 3 + t) % 256 < 128 ? 90 : 0

uint32_t program_v[PROGRAM_SIZE] = {
    VAL,
    128,
    END,
};
// clang-format on

uint32_t new_program_h[PROGRAM_SIZE];
uint32_t new_program_s[PROGRAM_SIZE];
uint32_t new_program_v[PROGRAM_SIZE];

uint32_t t = 0;

#pragma GCC push_options
#pragma GCC optimize("-O3")
uint32_t compute2(uint32_t prog[], int led_index) {
  const int STACK_SIZE = 100;
  uint32_t stack[STACK_SIZE];
  int ptr = -1;
  for (int i = 0; i < PROGRAM_SIZE; i++) {
    switch (prog[i]) {
      case SIN:
        stack[ptr] = sin_lookup[stack[ptr] % 256];
        break;
      case ADD:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] + stack[ptr + 1];
        break;
      case SUB:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] - stack[ptr + 1];
        break;
      case MUL:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] * stack[ptr + 1];
        break;
      case DIV:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] / stack[ptr + 1];
        break;
      case POW:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = pow(stack[ptr], stack[ptr + 1]);
        break;
      case MOD:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] % stack[ptr + 1];
        break;
      case IF:
        ptr -= 2;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] ? stack[ptr + 1] : stack[ptr + 2];
        break;
      case EQ:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] == stack[ptr + 1];
        break;
      case GT:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] > stack[ptr + 1];
        break;
      case LT:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] < stack[ptr + 1];
        break;
      case AND:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] & stack[ptr + 1];
        break;
      case OR:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] | stack[ptr + 1];
        break;
      case VAL:
        ptr++;
        if (ptr >= STACK_SIZE) return 1;
        stack[ptr] = prog[i + 1];
        i++;
        break;
      case VAR_T:
        ptr++;
        if (ptr >= STACK_SIZE) return 1;
        stack[ptr] = t;
        break;
      case VAR_I:
        ptr++;
        if (ptr >= STACK_SIZE) return 1;
        stack[ptr] = led_index;
        break;
      case END:
        return stack[0];
      default:
        break;
    }
  }
  return stack[0];
}

uint32_t run_program(uint32_t prog[], int led_index) {
  return compute2(prog, led_index);
}
#pragma GCC pop_options

// uint32_t run_program(uint32_t prog[], int led_index) {
//   return asm_compute(prog, uint32_t(led_index), t);
// }

int reading_index = 0;
int reading_section = 0;

WiFiClient socket_client;

void handle_raw_sockets() {

}

void handle_http() {

}

void handle_websockets() {

}

bool hsv = true;

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    NVIC_SystemReset();
  }

  if (!client.connected()) {
    client = server.available();
    reading_index = 0;
    reading_section = 0;
  } else {
    for (int i = 0; i < 200; i++) {
      if (client.available() >= 4) {
        uint32_t current_value;
        client.read(reinterpret_cast<uint8_t *>(&current_value),
                    sizeof current_value);

        if (reading_index == PROGRAM_SIZE) {
          client.stop();
          break;
        }

        if (reading_section == 0) {
          if (reading_index == 0 && current_value != PASS_P1) {
            client.stop();
            break;
          } else if (reading_index == 1 && current_value != PASS_P2) {
            client.stop();
            break;
          } else if (reading_index == 2) {
            hsv = current_value;
            reading_index = 0;
            reading_section += 1;
          } else {
            reading_index++;
          }
        } else if (reading_section == 1) {
          if (reading_index != 0 && new_program_h[reading_index - 1] == END &&
              current_value == 0) {
            reading_section++;
            reading_index = 0;
          } else {
            new_program_h[reading_index] = current_value;
            reading_index++;
          }
        } else if (reading_section == 2) {
          if (reading_index != 0 && new_program_s[reading_index - 1] == END &&
              current_value == 0) {
            reading_section++;
            reading_index = 0;
          } else {
            new_program_s[reading_index] = current_value;
            reading_index++;
          }
        } else if (reading_section == 3) {
          if (reading_index != 0 && new_program_v[reading_index - 1] == END &&
              current_value == 0) {
            for (int i = 0; i < PROGRAM_SIZE; i++) {
              program_h[i] = new_program_h[i];
              program_s[i] = new_program_s[i];
              program_v[i] = new_program_v[i];
            }

            client.stop();
          }
          new_program_v[reading_index] = current_value;
          reading_index++;
        }
      }
    }
  }

  ArduinoOTA.poll();

  for (int i = 0; i < LED_COUNT; i++) {
    uint32_t h = run_program(program_h, i);
    uint32_t s = run_program(program_s, i);
    uint32_t v = run_program(program_v, i);

    if (hsv) {
      leds[i] = CHSV(h % 256, s % 256, v % 256);
    } else {
      leds[i] = CRGB(h % 256, s % 256, v % 256);
    }
  }

  // for (int i = 0; i < LED_COUNT; i++) {
  //   uint32_t h = (t / 5 + i) * 5;
  //   uint32_t s = 255;
  //   uint32_t v = 90;

  //   if (hsv) {
  //     leds[i] = CHSV(h % 256, s % 256, v % 256);
  //   } else {
  //     leds[i] = CRGB(h % 256, s % 256, v % 256);
  //   }
  // }

  t++;

  // leds[0] = t % 256 > 128 ? CRGB(10, 10, 10) : CRGB(0, 0, 0);

  //   int segment_size = 3;
  //   int speed = 1;
  //   static int t = 0;
  //   for (int i = 0; i < LED_COUNT; i++) {
  //     leds[i] = CHSV(int(((t + i) / segment_size) / (1 / speed)) % 255,
  //     255, 120);
  //   }
  //   c++;

  FastLED.show();
}
