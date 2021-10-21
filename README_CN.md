[![npm](https://img.shields.io/badge/npm-1.1.3-orange.svg?style=flat-square)](https://www.npmjs.com/package/drcobj)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/ouyangzhaoxing/drcobj/blob/master/LICENSE)

### [English](https://github.com/ouyangzhaoxing/drcobj/blob/master/README.md)

Draco是一个用于压缩和解压缩3D几何网格和点云的开源库。它旨在改善3D图形的存储和传输。

你可以使用 **drcobj_exporter.js** 将 threejs-object (.json) 文件转换为 draco 压缩的 threejs-object (.drcobj) 文件， **drcobj_loader.js** 是 drcobj 文件的加载器。

---

## 新版本！

**相比1.0.3.2版本，1.1.x版本加载模型时间减少50%以上！**

## 模型文件尺寸比较

**测试模型：** ./example/bunny.json

| JSON | DRCOBJ | FBX | OBJ | GLTF | GLB |
| --- | --- | --- | --- | --- | --- |
| 2.98MB | 146KB | 1.82MB | 6.8MB | 2.12MB | 1.6MB |

---

## 如何使用

### 加载模型

示例: https://cdn.jsdelivr.net/gh/ouyangzhaoxing/drcobj@master/example/bunny.html

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

    drcobjLoader.dispose(); // 如果你不再需要...

});

</script>
```

### 转换模型

```html
<script src="./src/vendor/draco_encoder.js"></script>
<script src="./src/vendor/draco_exporter.min.js"></script>
<script src="./src/drcobj_exporter.min.js"></script>
```

```javascript
// function parse(json, options)
(new THREE.DrcobjExporter()).parse(three_object_json);
```

### 如果使用压缩

一般情况下不必压缩数据，除非模型内置纹理。

```html
<!-- https://github.com/imaya/zlib.js -->
<script src="zlib.min.js"></script>
```

```javascript
drcobjExporter.parse(three_object_json, {isDeflate:true});

drcobjLoader.load("model.drcobj", function (object) {...}, undefined, undefined, undefined, true);
```

---

## 许可证
#### [MIT License](https://github.com/ouyangzhaoxing/drcobj/blob/master/LICENSE)
