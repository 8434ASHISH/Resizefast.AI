const { jsPDF } = window.jspdf;

let originalImage = null;
let resizedImage = null;

document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', previewImage);
});

// Toggle KB input visibility
function toggleKBInput() {
    const kbRadio = document.querySelector('input[value="kb"]');
    const kbInput = document.querySelector('.kb-input');
    kbInput.style.display = kbRadio.checked ? 'block' : 'none';
    if (!kbRadio.checked) {
        document.getElementById('kbValue').value = '';
    }
}

// Image preview functionality
function previewImage() {
    const fileInput = document.getElementById('imageUpload');
    const preview = document.getElementById('imagePreview');
    const fileInfo = document.getElementById('fileInfo');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.src = e.target.result;
            preview.src = e.target.result;
            preview.style.display = 'block';
            fileInfo.textContent = `${file.name}<br>${(file.size / 1024).toFixed(2)} KB`;
        };
        reader.readAsDataURL(file);
    }
}

// Resize image function
function resizeImage() {
    const resizeType = document.querySelector('input[name="resizeType"]:checked').value;
    const aspectRatio = document.getElementById('aspectRatio').checked;
    const widthPx = parseInt(document.getElementById('widthPx').value) || originalImage.width;
    const heightPx = parseInt(document.getElementById('heightPx').value) || originalImage.height;
    const kbValue = parseInt(document.getElementById('kbValue').value);
    const outputFormat = document.querySelector('input[name="outputFormat"]:checked').value;
    const preview = document.getElementById('imagePreview');
    const resultInfo = document.getElementById('resultInfo');
    const pdfOption = document.getElementById('pdfOption');

    if (!originalImage) {
        alert('Please upload an image first!');
        return;
    }

    if (resizeType === 'kb' && (!kbValue || kbValue < 1)) {
        alert('Please enter a valid KB value!');
        return;
    }

    const canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    if (resizeType === 'pixels') {
        if (aspectRatio && heightPx) {
            const aspect = originalImage.width / originalImage.height;
            canvas.width = heightPx * aspect;
            canvas.height = heightPx;
        } else {
            canvas.width = widthPx || originalImage.width;
            canvas.height = heightPx || originalImage.height;
        }
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    } else if (resizeType === 'kb' && kbValue) {
        let targetKB = kbValue;
        let quality = 0.9;
        let dataURL;

        do {
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            dataURL = canvas.toDataURL(`image/${outputFormat}`, quality);
            quality -= 0.1;
        } while (dataURL.length / 1024 > targetKB * 1.5 && quality > 0);

        resizedImage = dataURL;
        preview.src = resizedImage;
        resultInfo.textContent = `Resized to approximately ${Math.round(dataURL.length / 1024)} KB`;
        resultInfo.style.display = 'block';
        pdfOption.style.display = 'block';
        return;
    }

    resizedImage = canvas.toDataURL(`image/${outputFormat}`);
    preview.src = resizedImage;
    resultInfo.textContent = `Resized to ${canvas.width}x${canvas.height} pixels (${Math.round(resizedImage.length / 1024)} KB)`;
    resultInfo.style.display = 'block';
    pdfOption.style.display = 'block';
}

// Convert to PDF function
function convertToPDF() {
    if (!resizedImage) {
        alert('Please resize an image first!');
        return;
    }

    const doc = new jsPDF();
    const img = new Image();
    img.src = resizedImage;
    img.onload = () => {
        doc.addImage(img, 'JPEG', 10, 10, 190, 0);
        doc.save('resized_image.pdf');
    };
}

// Download resized image (corrected to download image, not PDF)
function downloadPDF() {
    if (!resizedImage) {
        alert('Please resize an image first!');
        return;
    }
    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = 'resized_image.' + document.querySelector('input[name="outputFormat"]:checked').value;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
