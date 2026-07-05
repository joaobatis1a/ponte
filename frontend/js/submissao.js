// Contador de caracteres da descrição
const descricao = document.getElementById('descricao');
const counterCurrent = document.querySelector('.counter-current');
if (descricao && counterCurrent) {
  descricao.addEventListener('input', () => {
    counterCurrent.textContent = descricao.value.length;
  });
}

// Interação visual do dropzone de anexo
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileUpload');
const dropzoneFile = document.getElementById('dropzoneFile');

function showFileName(file) {
  if (!file || !dropzoneFile) return;
  dropzoneFile.textContent = `📎 ${file.name}`;
  dropzoneFile.classList.add('is-visible');
}

if (fileInput) {
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) showFileName(fileInput.files[0]);
  });
}

if (dropzone) {
  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) showFileName(file);
  });
}
