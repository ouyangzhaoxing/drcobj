[![npm](https://img.shields.io/badge/npm-1.1.3-orange.svg?style=flat-square)](https://www.npmjs.com/package/drcobj)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/ouyangzhaoxing/drcobj/blob/master/LICENSE)

### [简体中文](https://github.com/ouyangzhaoxing/drcobj/blob/master/README_CN.md)

Draco is an open-source library for compressing and decompressing 3D geometric meshes and point clouds. It is intended to improve the storage and transmission of 3D graphics.

You can use **drcobj_exporter.js** to convert a threejs-object (.json) file to a draco-compressed threejs-object (.drcobj) file, **drcobj_loader.js** is the loader for the drcobj file.

---

## New Version!

**Compared with version 1.0.3.2, version 1.1.x reduces model loading time by more than 50%!**

## Model file size comparison

**Test Model:** ./example/bunny.json

| JSON | DRCOBJ | FBX | OBJ | GLTF | GLB |
| --- | --- | --- | --- | --- | --- |
| 2.98MB | 146KB | 1.82MB | 6.8MB | 2.12MB | 1.6MB |

---

## How to use

### Load model

Example: https://cdn.jsdelivr.net/gh/ouyangzhaoxing/drcobj@master/example/bunny.html

```html
<script src="./three.js"></script>
<script src="./src/vendor/draco_decoder.js"></script>
<script src="./src/vendor/draco_loader.min.js"></script>
<script src="./src/drcobj_loader.min.js"></script>

<script>

var drcobjLoader = new THREE.DrcobjLoader();

drcobjLoader.setDecoderPath("./src/vendor/");

// function load(url, onLoad, onProgress, onDecodeProgress, onError, isInflate)
drcobjLoader.load("model.drcobj", function (object) {

    scene.add(object);

    drcobjLoader.dispose(); // If you no longer need...

});

</script>
```

### Conversion model

```html
<script src="./src/vendor/draco_encoder.js"></script>
<script src="./src/vendor/draco_exporter.min.js"></script>
<script src="./src/drcobj_exporter.min.js"></script>
```

```javascript
// function parse(json, options)
(new THREE.DrcobjExporter()).parse(three_object_json);
```

### If Use Zlib

Normally there is no need to compress data, unless the model has built-in textures.

```html
<!-- https://github.com/imaya/zlib.js -->
<script src="zlib.min.js"></script>
```

```javascript
drcobjExporter.parse(three_object_json, {isDeflate:true});

drcobjLoader.load("model.drcobj", function (object) {...}, undefined, undefined, undefined, true);
```

---

## License
#### [MIT License](https://github.com/ouyangzhaoxing/drcobj/blob/master/LICENSE)
