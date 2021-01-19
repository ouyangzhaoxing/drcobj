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

THREE.DrcobjLoader = (function () {

  function DrcobjLoader(manager) {
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
  }

  DrcobjLoader.prototype.setPath = function (value) { this.path = value; };
  DrcobjLoader.prototype.setResourcePath = function (value) { this.resourcePath = value; };
  DrcobjLoader.prototype.setDecoderPath = function (value) { this.decoderPath = value; };

  DrcobjLoader.prototype.load = function (url, onLoad, onProgress, onDecodeProgress, onError, isInflate) {

    var self = this;

    var path = (this.path === undefined) ? extractUrlBase(url) : this.path;
    this.resourcePath = this.resourcePath || path;

    var fileLoader = new THREE.FileLoader(self.manager);
    fileLoader.setPath(self.path);
    fileLoader.setResponseType("arraybuffer");

    fileLoader.load(url, function (buffer) { self.parse(buffer, onLoad, onDecodeProgress, isInflate); }, onProgress, onError);

  };

  DrcobjLoader.prototype.parse = function (buffer, onLoad, onDecodeProgress, isInflate) {

    var self = this;

    if (self.objectLoader === undefined) { self.objectLoader = new THREE.ObjectLoader(); }
    self.objectLoader.setResourcePath(this.resourcePath);

    if (self.dracoLoader === undefined) {
      self.dracoLoader = new THREE.DRACOLoader();
      self.dracoLoader.setDecoderPath(self.decoderPath);
      self.dracoLoader.setDecoderConfig({ type: "wasm" });
      self.dracoLoader.setWorkerLimit(8);
    }

    if (isInflate) { buffer = (new Zlib.Inflate(new Uint8Array(buffer))).decompress().buffer; }

    var modelDataSize = (new Uint32Array(buffer, 0, 1))[0];
    var modelData = new Uint8Array(buffer, 4, modelDataSize);
    var jsonData = JSON.parse(THREE.LoaderUtils.decodeText(modelData));

    var geometryBufferStart, geometryBufferEnd, geometryBuffer, finishCount = 0;
    var geometriesDataOffset = 4 + modelDataSize;

    for (var i = 0; i < jsonData.geometries.length; i++) { decode(i); }

    function decode(i) {

      geometryBufferStart = geometriesDataOffset + jsonData.geometries[i].data.offset;
      geometryBufferEnd = geometryBufferStart + jsonData.geometries[i].data.byteLength;
      geometryBuffer = buffer.slice(geometryBufferStart, geometryBufferEnd);

      self.dracoLoader.decodeDracoFile(geometryBuffer, function (geometry) {

        geometry.uuid = jsonData.geometries[i].uuid;

        if (jsonData.geometries[i].name !== undefined) {
          geometry.name = jsonData.geometries[i].name;
        }

        if (jsonData.geometries[i].userData !== undefined) {
          geometry.userData = jsonData.geometries[i].userData;
        }

        jsonData.geometries[geometry.uuid] = geometry;

        ++finishCount;

        if (onDecodeProgress) {
          onDecodeProgress(finishCount / jsonData.geometries.length * 100);
        }

        if (finishCount === jsonData.geometries.length) {
          if (onLoad) { parseJSON(jsonData, onLoad); }
        }

      });

    }

    // 内置3D对象JSON解析代码 并修改其中网格解析部分 避免多余的解析
    // https://github.com/mrdoob/three.js/blob/master/src/loaders/ObjectLoader.js

    function parseJSON(json, onLoad) {

      // const animations = self.objectLoader.parseAnimations(json.animations);
      // const shapes = self.objectLoader.parseShapes(json.shapes);
      // const geometries = self.objectLoader.parseGeometries(json.geometries, shapes);

      const geometries = json.geometries; // 直接忽略不处理

      const images = self.objectLoader.parseImages(json.images, function () {

        if (onLoad !== undefined) onLoad(object);

      });

      const textures = self.objectLoader.parseTextures(json.textures, images);
      const materials = self.objectLoader.parseMaterials(json.materials, textures);

      const object = self.objectLoader.parseObject(json.object, geometries, materials, undefined);
      // const skeletons = self.objectLoader.parseSkeletons(json.skeletons, object);

      // self.objectLoader.bindSkeletons(object, skeletons);

      //

      if (onLoad !== undefined) {

        let hasImages = false;

        for (const uuid in images) {

          if (images[uuid] instanceof HTMLImageElement) {

            hasImages = true;
            break;

          }

        }

        if (hasImages === false) onLoad(object);

      }

      return object;

    }

  };

  DrcobjLoader.prototype.dispose = function () { this.dracoLoader.dispose(); };

  var extractUrlBase = function (url) {
    var index = url.lastIndexOf("/");
    if (index === - 1) { return "./"; } return url.substr(0, index + 1);
  };

  return DrcobjLoader;

})();
