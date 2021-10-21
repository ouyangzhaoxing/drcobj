/**
 * @author Blinking / https://blinking.fun/
 * 
 * MIT License
 * 
 * Copyright (c) 2019-2021 Blinking
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

import * as THREE from "three";
import { DRACOExporter } from "./vendor/draco_exporter.module.js";

class DrcobjExporter {

  parse(json, options) {

    let outputDataBuffer, sumGeometryBuffersByteLength = 0;

    if (options === undefined) { options = {}; }

    let drcGeometries = this.drcParse(json, options);

    for (let i = 0; i < json.geometries.length; i++) {

      let geometryBufferByteLength = drcGeometries[i].byteLength;

      json.geometries[i].data = {
        offset: sumGeometryBuffersByteLength,
        byteLength: geometryBufferByteLength
      };

      sumGeometryBuffersByteLength += geometryBufferByteLength;

    }

    let jsonBuffer = stringToByteArray(JSON.stringify(json));

    outputDataBuffer = new ArrayBuffer(4 + jsonBuffer.byteLength + sumGeometryBuffersByteLength);

    let modelDataSize = new Uint32Array(outputDataBuffer, 0, 1);
    let modelData = new Uint8Array(outputDataBuffer, 4, jsonBuffer.byteLength);
    let modelGeometries = new Int8Array(outputDataBuffer, 4 + jsonBuffer.byteLength, sumGeometryBuffersByteLength);

    modelDataSize[0] = jsonBuffer.byteLength;

    modelData.set(new Uint8Array(jsonBuffer));

    for (let j = 0, offset = 0; j < drcGeometries.length; j++) {

      modelGeometries.set(drcGeometries[j], offset);

      offset += drcGeometries[j].byteLength;

    }

    if (options.isDeflate) {

      let ui8OutputDataBuffer = new Uint8Array(outputDataBuffer);
      let deflate = new Zlib.Deflate(ui8OutputDataBuffer);

      outputDataBuffer = deflate.compress();

    }

    return outputDataBuffer;

  }

  drcParse(json, options) {

    let drcGeometries = [];
    let dracoExporter = new DRACOExporter;
    let bufferGeometryLoader = new THREE.BufferGeometryLoader();

    if (options.decodeSpeed === undefined) { options.decodeSpeed = 5; }
    if (options.encodeSpeed === undefined) { options.encodeSpeed = 5; }
    if (options.encoderMethod === undefined) { options.encoderMethod = DRACOExporter.MESH_EDGEBREAKER_ENCODING; }
    if (options.quantization === undefined) { options.quantization = [16, 8, 10, 8, 8]; }
    if (options.exportUvs === undefined) { options.exportUvs = true; }
    if (options.exportNormals === undefined) { options.exportNormals = true; }
    if (options.exportColor === undefined) { options.exportColor = false; }

    for (let i = 0; i < json.geometries.length; i++) {

      let geometry = bufferGeometryLoader.parse(json.geometries[i]);
      let drcGeometry = dracoExporter.parse(geometry, options);

      drcGeometries.push(drcGeometry);

    }

    return drcGeometries;

  }

}

function stringToByteArray(str) {

  function str2UTF8(str) {
    let bytes = new Array();
    let len, c;
    len = str.length;
    for (let i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10FFFF) {
        bytes.push(((c >> 18) & 0x07) | 0xF0);
        bytes.push(((c >> 12) & 0x3F) | 0x80);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
        bytes.push(((c >> 12) & 0x0F) | 0xE0);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007FF) {
        bytes.push(((c >> 6) & 0x1F) | 0xC0);
        bytes.push((c & 0x3F) | 0x80);
      } else {
        bytes.push(c & 0xFF);
      }
    }
    return bytes;
  }

  return new Uint8Array(str2UTF8(str)).buffer;

}

export { DrcobjExporter };
