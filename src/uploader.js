import {read, write, destroy} from './localStorage';

import * as faceapi from 'face-api.js';

import { v4 as uuidv4 } from 'uuid';

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

const uploadFile = file => {
    return new Promise((resolve, reject) => {

        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
            fs.root.getFile(`${file.name}${uuidv4()}`, { create: true, exclusive: true }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.write(file);
                    resolve(fileEntry);
                }, e => console.log(e));
            }, e => console.log(e));
        })

    })

}

const fileEntryPathToObjectUrl = async fileEntryPath => {
    return URL.createObjectURL(await new Promise((resolve, reject) => {
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
            fs.root.getFile(fileEntryPath, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.file(resolve, reject)
            }, e => console.log(e));
        })
    }))
}



// para el boton
const uploader = (submitSelector, imagesListSelector) => {

    const submit = document.querySelector(submitSelector);
    const imagesList = document.querySelector(imagesListSelector);
    const imageDescriptors = [];
    let faceMatcher;

    // procesado de imagenes del contenedor
    const processFace = async (image, imageContainer, id) => {
        const detection = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
        //console.log(detection);
        if (typeof detection === 'undefined'){
            imageContainer.querySelector('.status').innerText = 'no se pudo procesar';
            return
        }
        imageDescriptors.push({
            id: id,
            detection
        })
        imageContainer.querySelector('.status').innerText = 'procesado';

        faceMatcher = new faceapi.FaceMatcher(imageDescriptors.map(faceDescriptor => (
            new faceapi.LabeledFaceDescriptors(
                (faceDescriptor.id).toString(), [faceDescriptor.detection.descriptor]
            )
        )))
        //console.log(faceMatcher);
    }

    const syncImages = () => {

        while (imagesList.firstChild) {
            imagesList.removeChild(imagesList.firstChild);
        }

        
        read().forEach(async image => {
            const imageContainer = document.createElement('div');
            const label = document.createElement('input');
            const imageElement = document.createElement('img');
            //estado 
            const status = document.createElement('div');

            const deleteLink = document.createElement('a');
            imageContainer.classList.add('image-container');
            deleteLink.classList.add('cerrar');
            imageElement.classList.add('card-img-top');
            imageContainer.id = image.id;
            deleteLink.href= '#';
            deleteLink.innerText = 'X';
            //status classlist
            status.classList.add('status');

            status.innerText = 'Pendiente';

            imageElement.src = await fileEntryPathToObjectUrl(image.path);
            label.value = image.name;

            deleteLink.addEventListener('click', e => {
                e.preventDefault();
                destroy(image.id);
                syncImages();
            });

            imageContainer.appendChild(deleteLink);
            imageContainer.appendChild(status);
            imageContainer.appendChild(imageElement);
            //imageContainer.appendChild(status);

            imagesList.appendChild(imageContainer);

            processFace(imageElement, imageContainer, image.id);

        })
    }


    submit.addEventListener('change', async e => {

        const fileEntry = await uploadFile(e.target.files[0]);

        write([
            ...read(),
            {
                id: uuidv4(),
                path: fileEntry.fullPath,
                name: uuidv4().toString()
            }
        ])
        syncImages();
    })
    syncImages();

    return descriptor => {
        if (!faceMatcher || !descriptor) return;
        const match = faceMatcher.findBestMatch(descriptor);
        [...imagesList.children].forEach(image => {
            if (match.label === image.id) {
                image.classList.add('selected');
                return
            }
            return image.classList.remove('selected')
        })

        return match
    }

}

export default uploader;