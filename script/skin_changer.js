/**
 * Created by tsugawa-r on 2/24/16.
 */
'use strict';
document.body.appendChild(function() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.text = '';

  var code_skin = function() {
    var bg_selector = $('#col_messages');
    var selected_img_name = '';
    var is_already_set_bg = false;
    var saved_cnt_tmp = 0;
    var STORAGE_CAPACITY = 1024 * 1024 * 50;
    var CHANGE_INTERVAL = 1000 * 60 * 60;
    var change_interval;
    var srcs = [];

    var bg_opacity = localStorage.getItem('bg-opacity');
    if (bg_opacity) {
      $('#col_messages .row-fluid, #footer').css({"background-color": "rgba(255, 255, 255, " + bg_opacity + ")"});
      $('#messages_container').css({"background-color": "rgba(255, 255, 255, " + bg_opacity + ")"});
    }

    var is_auto_change = localStorage.getItem('is_auto_change');

    // 管理画面用DOMの構築
    var change_skin_div = document.createElement('div');
    change_skin_div.id = 'change-skin';
    change_skin_div.innerHTML = 'Change Background';
    document.body.appendChild(change_skin_div);

    var div = document.createElement('div');
    div.id = 'skin-ext-setting';

    var input = document.createElement('input');
    input.type = 'file';
    input.id = 'form-bg-images';
    input.setAttribute('multiple', 'multiple');

    div.appendChild(input);

    var image_elem_h = document.createElement('h3');
    image_elem_h.innerHTML = 'Saved Images';
    image_elem_h.className = 'title';
    div.appendChild(image_elem_h);

    var img_div = document.createElement('div');
    img_div.id = 'imgs-list';
    div.appendChild(img_div);

    // 透明度設定
    var setting_elem_h = document.createElement('h3');
    setting_elem_h.innerHTML = 'Transparency Setting';
    setting_elem_h.className = 'title';
    div.appendChild(setting_elem_h);

    var bar_area = document.createElement('div');
    bar_area.id = 'opacity-bar-area';

    var span0 = document.createElement('span');
    span0.innerHTML = 0;
    bar_area.appendChild(span0);

    var bar = document.createElement('input');
    bar.id = 'opacity-bar';
    bar.type = 'range';
    bar.min = 0;
    bar.max = 1;
    bar.step = 0.1;
    bar.value = bg_opacity ? bg_opacity : 0.7;
    bar_area.appendChild(bar);

    var span1 = document.createElement('span');
    span1.innerHTML = 1;
    bar_area.appendChild(span1);

    var bg_saved_span = document.createElement('span');
    bg_saved_span.className = 'saved';
    bg_saved_span.innerHTML = 'Saved Opacity!!';
    bar_area.appendChild(bg_saved_span);

    div.appendChild(bar_area);

    var setting_elem_h = document.createElement('h3');
    setting_elem_h.innerHTML = 'Slide Show Setting';
    setting_elem_h.className = 'title';
    div.appendChild(setting_elem_h);

    var auto_change_bg = document.createElement('div');
    auto_change_bg.id = 'auto-change-area';

    var auto_change_checkbox = document.createElement('input');
    auto_change_checkbox.id = 'auto-change-bg';
    auto_change_checkbox.type = 'checkbox';
    auto_change_checkbox.checked = is_auto_change == 'true' ? true : false;
    auto_change_bg.appendChild(auto_change_checkbox);

    var label = document.createElement('label');
    label.htmlFor = 'auto-change-bg';
    label.innerHTML = 'Change Background Image Every Hour.';
    auto_change_bg.appendChild(label);

    var auto_change_bg_saved_span = document.createElement('span');
    auto_change_bg_saved_span.className = 'saved';
    auto_change_bg_saved_span.innerHTML = 'Saved!!';
    auto_change_bg.appendChild(auto_change_bg_saved_span);

    div.appendChild(auto_change_bg);

    var p = document.createElement('p');
    p.id = 'close-skin-ext-page';
    p.innerHTML = 'CLOSE';
    div.appendChild(p);

    document.body.appendChild(div);

    // 背景画像変更エリア関連のイベントハンドラ
    $(document).on('click', '#close-skin-ext-page', function() {
      $('#skin-ext-setting').hide(0, function() {
        $('#change-skin').show();
      });
    });

    $(document).on('click', '#change-skin', function() {
      $(this).hide(0, function() {
        $('#skin-ext-setting').show();
      });
    });

    $(document).on('click', '#skin-ext-setting .bgimage img', function(e) {
      $('#imgs-list .selected').hide();
      $('#col_messages').css({"background-image": "url('" + e.target.src + "')"});
      selected_img_name = e.target.alt;
      if (is_auto_change == 'true') {
        clearTimeout(change_interval);
        console.log('STOOOOP!');
        setBackgroundImage(srcs, true);
        console.log('START!');
      } else {
        setBackgroundImage(srcs);
      }
      console.log('selected:', selected_img_name);

      $(e.target).next().next().show();
    });

    $(document).on('click', '#div-none', function(e) {
      $('#col_messages').css({"background-image": "none"});
      $('#imgs-list .selected').hide();
      $('#div-none .selected').show();
      clearTimeout(change_interval);
      console.log('STOOOOP!');
    });

    $(document).on('click', '.del-img', function(e) {
      clearTimeout(change_interval);
      console.log('STOOOOP!');
      deleteImage(e.target.dataset.imgName);
    });

    // フォームからの画像選択
    $(document).on('change', '#form-bg-images', function(e) {
      clearTimeout(change_interval);
      console.log('STOOOOP!');
      var fileList, file;

      fileList = this.files;
      for (var i = 0, l = fileList.length; i < l; i++) {
        // 対象のファイルを取得
        file = fileList[i] ;
        if (i === l - 1) {
          // ループの最後にコールバックを渡す
          saveImage(file, loadImages);
        } else {
          saveImage(file);
        }
      }
    });

    // opacity slider
    $(document).on('input', '#opacity-bar', function(e) {
      $('#messages_container').css({"background-color": "rgba(255, 255, 255, " + e.target.value + ")"});
    });

    $(document).on('change', '#opacity-bar', function(e) {
      $('#messages_container').css({"background-color": "rgba(255, 255, 255, " + e.target.value + ")"});
      localStorage.setItem('bg-opacity', e.target.value);
      $('#opacity-bar-area .saved').show(0, function() {$(this).fadeOut(2500)});
    });

    // Change Background Image automatically.
    $(document).on('change', '#auto-change-area input', function(e) {
      localStorage.setItem('is_auto_change', $(this).prop('checked'));
      $('#auto-change-area .saved').show(0, function() {$(this).fadeOut(2500)});

      if ($(this).prop('checked')) {
        setBackgroundImage(srcs, true);
        console.log('START!');
      } else {
        clearTimeout(change_interval);
        console.log('STOOOOP!');
      }
    });

    // Delete image
    function deleteImage(file_name) {
      function fsCallback(fs) {
        fs.root.getFile(file_name, {create: false}, function(fileEntry) {
          fileEntry.remove(function() {
            console.log('Removed File.', fileEntry.fullPath);
            loadImages();
          }, errorCallback);
        });
      }

      webkitRequestFileSystem(window.PERSISTENT, 0, fsCallback, errorCallback);
    }

    // Save image
    function saveImage(content, callback) {
      function fsCallback(fs) {
        fs.root.getFile(content.name, {create: true}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwriteend = function(e) {
              callback && callback();
              console.log("Success! : " + fileEntry.fullPath);
            };

            fileWriter.onerror = function(e) {
              console.log("Failed: " + e);
            };

            var output = new Blob([content], {type: content.type});
            fileWriter.write(output);
          }, errorCallback);
        }, errorCallback);
      }
      navigator.webkitPersistentStorage.requestQuota(STORAGE_CAPACITY, function(Bytes) {
        webkitRequestFileSystem(window.PERSISTENT, Bytes, fsCallback, errorCallback);
      }, errorCallback);
    }

    // Load Images
    function loadImages() {
      // 画像表示エリアのDOMを初期化
      document.getElementById('imgs-list').innerHTML = '';

      webkitRequestFileSystem(window.PERSISTENT, 0, function(fs) {
        var dirname = '/';
        fs.root.getDirectory(dirname, {}, function(dirEntry) {
          var dirReader = dirEntry.createReader();
          dirReader.readEntries(function(list) {
            var setting_elem = document.getElementById('imgs-list');
            var div_none = document.createElement('div');
            div_none.id = 'div-none';
            div_none.className = 'bgimage';
            div_none.innerHTML = 'NONE';

            var select_div = document.createElement('div');
            select_div.className = 'selected';
            select_div.innerHTML = '&#10004;';
            div_none.appendChild(select_div);

            setting_elem.appendChild(div_none);

            var cnt = 0;

            if (list.length === 0) {
              $('#col_messages').css({"background-image": "none"});
              $('#div-none .selected').show();
              return;
            }
            srcs = [];

            for (var i = 0, l = list.length; i < l; i++) {
              fs.root.getFile(list[i].name, {}, function(fileEntry) {
                fileEntry.file(function(file) {
                  var src = window.URL.createObjectURL(file);
                  srcs.push({"src": src, "name": file.name});

                  var div = document.createElement('div');
                  div.className = 'bgimage';
                  var img = document.createElement('img');
                  img.src = src;
                  img.alt = file.name;
                  div.appendChild(img);

                  var p = document.createElement('p');
                  p.innerHTML = '×';
                  p.className = 'del-img';
                  p.dataset.imgName = file.name;
                  div.appendChild(p);

                  var select_div = document.createElement('div');
                  select_div.className = 'selected';
                  select_div.innerHTML = '&#10004;';

                  if (file.name === selected_img_name) {
                    is_already_set_bg = true;
                    select_div.style.display = 'block';
                  }

                  div.appendChild(select_div);
                  setting_elem.appendChild(div);

                  if (cnt === l - 1) {
                    if (!is_already_set_bg) {
                      if (is_auto_change == 'true') {
                        setBackgroundImage(srcs, true, true);
                        console.log('START!');
                      } else {
                        setBackgroundImage(srcs, false, true);
                      }
                    } else {
                      if (is_auto_change == 'true') {
                        setBackgroundImage(srcs, true);
                        console.log('START!');
                      }
                    }
                    is_already_set_bg = false;
                  }
                  cnt++;
                }, errorCallback);
              }, errorCallback);
            }
          }, errorCallback);
        }, errorCallback);
      }, errorCallback);
    }

    function setBackgroundImage(srcs, is_slide_show, is_random) {
      if (is_random) {
        var index = Math.floor(Math.random() * srcs.length);
        bg_selector.css({"background-image": "url('" + srcs[index].src + "')"});
        selected_img_name = srcs[index].name;
        $('#imgs-list .selected').hide();
        $('#imgs-list .selected').eq(index + 1).show();
      }
      console.log('selected:', selected_img_name);
      if (is_slide_show) {
        change_interval = setTimeout(setBackgroundImage, CHANGE_INTERVAL, srcs, is_slide_show, true);
      }
    }

    // リリース時にTEMPORARYに画像保存してしまっていたので、PERSISTENT領域に画像を移動させる処理が必要
    function deleteTemporaryImage(file_name) {
      function fsCallback(fs) {
        fs.root.getFile(file_name, {create: false}, function(fileEntry) {
          fileEntry.remove(function() {
            console.log('Removed TEMPORARY File.', fileEntry.fullPath);
          }, errorCallback);
        });
      }
      webkitRequestFileSystem(window.TEMPORARY, 0, fsCallback, errorCallback);
    }

    function loadTemporaryImages() {
      // 画像表示エリアのDOMを初期化
      document.getElementById('imgs-list').innerHTML = '';
      webkitRequestFileSystem(window.TEMPORARY, 0, function(fs) {
        var dirname = '/';
        fs.root.getDirectory(dirname, {}, function(dirEntry) {
          var dirReader = dirEntry.createReader();
          dirReader.readEntries(
            function(list) {
              if (list.length === 0) {
                return loadImages();
              }
              for (var i = 0, l = list.length; i < l; i++) {
                fs.root.getFile(list[i].name, {}, function(fileEntry) {
                  fileEntry.file(function(file) {
                    saveImage(file, function() {
                      if (saved_cnt_tmp === l - 1) {
                        loadImages();
                      }
                      saved_cnt_tmp++;
                      deleteTemporaryImage(file.name);
                    });
                  }, errorCallback);
                }, errorCallback);
              }
            }, errorCallback);
          }, errorCallback);
      }, errorCallback);
    }

    // 共通エラーハンドラ
    function errorCallback(e) {
      console.log("Error: " + e.name);
    }

    //loadImages();
    loadTemporaryImages();
  };

  script.text += "(" + code_skin.toString() + ")();";
  return script;
}());
