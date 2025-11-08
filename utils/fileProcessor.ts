
declare const pdfjsLib: any;

interface ImagePart {
  mimeType: string;
  data: string;
}

const fileToGenerativePart = async (file: File): Promise<ImagePart> => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    mimeType: file.type,
    data: base64EncodedData,
  };
};

const pdfToImageParts = async (file: File): Promise<ImagePart[]> => {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result as ArrayBuffer);
            const imageParts: ImagePart[] = [];
            
            try {
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (!context) {
                        return reject(new Error('Could not get canvas context'));
                    }

                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    imageParts.push({
                        mimeType: 'image/jpeg',
                        data: dataUrl.split(',')[1],
                    });
                }
                resolve(imageParts);
            } catch (error) {
                reject(error);
            }
        };
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
    });
};

export const processFiles = async (files: File[]): Promise<ImagePart[]> => {
    const allImageParts: ImagePart[] = [];
    for (const file of files) {
        if (file.type === 'application/pdf') {
            const pdfImages = await pdfToImageParts(file);
            allImageParts.push(...pdfImages);
        } else if (file.type.startsWith('image/')) {
            const imagePart = await fileToGenerativePart(file);
            allImageParts.push(imagePart);
        }
    }
    return allImageParts;
};
