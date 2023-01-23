// let vars = document.querySelectorAll(".var-item");

let edtInit = async function (content = '') {

  let vars = gf.evs,
    edtInputText = `
      <div class="custom-panel">
       <label>Define um nome do campo <input id="iname" type="text" name="iname"></label>
       <label>Exemplo <input id="iexemp" type="text" name="iexemp"></label>
       <div class="inline">
         <label>Mínimo de caracteres <input id="imin" type="number" name="imin"></label>
         <label>Máximo de caracteres <input id="imax" type="number" name="imax"></label>
       </div>
      </div> `,

  editorOpt = {
    selector: '#editor',
    language: 'pt_BR',
    content_css: 'default',
    skin: 'oxide',
    plugins: [
      'advlist', 'anchor', 'autolink', 'fullscreen', 'help',
      'image', 'lists', 'link', 'media', 'preview', 'visualchars', 'pagebreak',
      'searchreplace', 'table', 'visualblocks', 'wordcount', 'noneditable', 'codeeditor', 'editfield',
    ],
    images_file_types: 'png,jpg,svg,webp',
    file_picker_types: 'file image media',
    automatic_uploads: true,
    noneditable_class: 'var-editor',
    inlinecss: true,
    draggable_modal: true,
    valid_elements: '@[id|class|style|onclick|ondblclick|contenteditable],sup[class|style],u[class|style],s[class|style],sub[class|style],span[class|style],table[class|style|colspan|rowspan],tr[class|style|colspan|rowspan],td[class|style|colspan|rowspan],tbody[class|style|colspan|rowspan],b[class|style],a[class|style|href|src],p[class|style],-div[id|dir|class|align|style],ins[datetime|cite],-ul[class|style],-li[class|style],code[class|style|contenteditable],img[class|style|src|width|height|data],var[class|style|src|data|contenteditable],hr[class|style], input[style|class|type],textarea[style|class|rows|cols]',
    extended_valid_elements: 'input[class|style|type|name|minlength|maxlength|min|max|placeholder|required|ondblclick],textarea[rows|cols|class|style|required]',
    toolbar: 'insertfile a11ycheck undo redo pagebreak editfield | bold italic style fontsize lineheight | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | link image fullscreen table tablecellprops tablecellbackgroundcolor tablecellbordercolor openVars addField codeeditor ',
    pagebreak_separator: '<p style="text-align:center" class="page-break">-------- QUEBRA DE PÁGINA --------</p>',
    font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 30pt 36pt 48pt 56pt 70pt 80pt 90pt',
    formats: {
      bold: { inline: 'b', 'classes': 'bold' },
      italic: { inline: 'i', 'classes': 'italic' },
      underline: { inline: 'u', 'classes': 'underline', exact: true },
      forecolor: { inline: 'span', classes: 'forecolor', styles: { color: '%value' } },
      hilitecolor: { inline: 'span', classes: 'hilitecolor', styles: { backgroundColor: '%value' } },
    },
    my_custom_variable: 'test',
    line_height_formats: '0 0.5 0.8 1 1.2 1.4 1.6 2',
    table_sizing_mode: 'auto',
    table_column_resizing: 'resizetable',
    format_noneditable_selector: 'code',
    color_cols: 5,
    color_map: [
      '#D0f0f0', 'Light Green',
      '#FBEEB8', 'Light Yellow',
      '#F8CAC6', 'Light Red',
      '#ECCAFA', 'Light Purple',
      '#C2E0F4', 'Light Blue',

      '#2DC26B', 'Green',
      '#F1C40F', 'Yellow',
      '#E03E2D', 'Red',
      '#B96AD9', 'Purple',
      '#3598DB', 'Blue',

      '#169179', 'Dark Turquoise',
      '#E67E23', 'Orange',
      '#BA372A', 'Dark Red',
      '#843FA1', 'Dark Purple',
      '#236FA1', 'Dark Blue',

      '#ECF0F1', 'Light Gray',
      '#CED4D9', 'Medium Gray',
      '#95A5A6', 'Gray',
      '#7E8C8D', 'Dark Gray',
      '#34495E', 'Navy Blue',

      '#5291c5', 'Azul 1',
      '#86b6d8', 'Azul 2',
      '#E8813E', 'Laranja 1',
      '#EEA16F', 'Laranja 2',
      '#ff711557', 'Marron 1',

      '#74411F', 'Marron 2',
      '#F4C09F', 'Marron 3',
      '#AE612F', 'Marron 4',
      '#AE612F', 'Marron 5',
      '#000000', 'Black',

      '#ffffff', 'White'
    ],
    codeeditor_themes_pack: 'twilight merbivore dawn kuroir', // or ["twilight", "merbivore", "dawn", "kuroir"]
    codeeditor_wrap_mode: true,
    codeeditor_font_size: 14,
    file_picker_callback: (cb, value, meta) => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')

      input.addEventListener('change', (e) => {
        const file = e.target.files[0]

        const reader = new FileReader()
        reader.addEventListener('load', () => {
          /*
            Note: Now we need to register the blob in TinyMCEs image blob
            registry. In the next release this part hopefully won't be
            necessary, as we are looking to handle it internally.
          */
          const id = 'blobid' + (new Date()).getTime()
          const blobCache = tinymce.activeEditor.editorUpload.blobCache
          const base64 = reader.result.split(',')[1]
          const blobInfo = blobCache.create(id, file, base64)
          blobCache.add(blobInfo)

          /* call the callback and populate the Title field with the file name */
          cb(blobInfo.blobUri(), { title: file.name })
        })
        reader.readAsDataURL(file)
      })

      input.click()
    },

    setup: (editor) => {
      const onAction = (autocompleteApi, rng, value) => {
        editor.selection.setRng(rng)
        editor.insertContent(value)
        autocompleteApi.hide()

      }

      const getMatchedChars = (pattern) => {
        return completeVars.filter((char) => char.text.indexOf(pattern) !== -1)
      }

      /* An autocompleter that allows you to insert special characters */
      editor.ui.registry.addAutocompleter('specialchars', {
        ch: 'K_',
        minChars: 1,
        columns: 'auto',
        onAction: onAction,
        fetch: (pattern) => {
          return new Promise((resolve) => {

            const results = getMatchedChars(pattern).map((char) => ({
              type: 'autocompleteitem',
              value: char.value,
              text: char.text,
              icon: char.description,
              varid: char.varid
            }))

            resolve(results)

          })
        }
      })
      /* End autocompleter */

      /* Custom var buttons */
      var toggleState = false

      editor.ui.registry.addMenuButton('openVars', {
        icon: 'comment-add',
        tooltip: 'Variáveis',
        fetch: function (callback) {

          let menuvars = []
          for (let i = 0; i < completeVars.length; i++) {
            // console.log(completeVars[i])
            menuvars[i] = {
              type: 'menuitem',
              text: completeVars[i].text,
              onAction: function () {
                editor.insertContent(completeVars[i].value)
              }
            }

          }

          // console.log(menuvars)

          var items = menuvars
          callback(items)
        }
      })
      /* End Custom var buttons */

      /* Custom Field button */
      editor.ui.registry.addMenuButton('addField', {
        icon: 'paste-row-before',
        tooltip: 'Adicionar campos',
        fetch: function (callback) {

          let fieldoptions = [
            {
              type: 'menuitem',
              text: 'Campo Texto',
              onAction: function () {
                tinymce.activeEditor.windowManager.open({
                  title: 'Adicionar campo do Tipo Texto',
                  level: 'info',
                  body: {
                    type: 'panel',
                    name: 'text_field',
                    items: [
                      {
                        type: 'htmlpanel', // an HTML panel component
                        html: edtInputText
                      },
                    ]
                  },
                  buttons: [
                    { type: 'cancel', text: 'Fechar' },
                    { type: 'submit', buttonType: 'primary', text: 'Inserir campo' }
                  ],
                  onSubmit: function () {
                    let required = $('#imin').val() >= 1 ? 'required' : ''
                    editor.insertContent(`<input 
                            placeholder="` + $('#iexemp').val() + `" 
                            minlength="` + $('#imin').val() + `" 
                            maxlength="` + $('#imax').val() + `" 
                            name="` + $('#iname').val() + `" 
                            ${required}
                            ondblclick="edtField(this)"
                            type="text" 
                      /> `)
                    tinymce.activeEditor.windowManager.close()
                  }
                })
              }
            },
            {
              type: 'menuitem',
              text: 'Campo Textarea',
              onAction: function () {
                editor.insertContent('<textarea rows="5" cols="5"></textarea>')
              }
            }
          ]

          callback(fieldoptions)

        }

      })
      /* End Custom Field button */
    },
  }

  var completeVars = []
  for (let i = 0; i < vars.length; i++) {

    let varfield = `<code data-var="${vars[i]}" ondblclick="this.remove()" class="var-editor" >${vars[i]}</code>`

    completeVars[i] = { text: vars[i], value: varfield, description: vars[i] }
  }

  $('.var-item').click(function () {

    let varfield = `<code data-var="${this.dataset.var}" ondblclick="this.remove()" class="var-editor" >${this.dataset.var}</code>`

    tinymce.activeEditor.execCommand('mceInsertContent', false, varfield)
  })

  await tinymce.init(editorOpt)
  if (content) {
    tinymce.activeEditor.setContent(content)
  }

}
