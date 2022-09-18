import '../node_modules/babel-polyfill';

import * as faceapi from '../node_modules/face-api.js';

import uploader from './uploader';

const main = async() => {
    const videoContainer = document.querySelector('.js-video');
    const canvas = document.getElementById('js-canvas');
    const context = canvas.getContext('2d');
    const video = await navigator.mediaDevices.getUserMedia({ video: true });

    //librerias faceapi
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
    await faceapi.nets.faceExpressionNet.loadFromUri('/models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models')

    const match = uploader('.input-submit', '.images-list');

    videoContainer.srcObject = video;

    const reDraw = async() => {
        context.drawImage(videoContainer, 0, 0, 640, 480);

        requestAnimationFrame(reDraw);

    }

    // procesado de imagenes del canvas
    const processFace = async() => {
        const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor()
            //console.log(detection);
        if (typeof detection === 'undefined') return;
        match(detection.descriptor); // comparacion con el resultado de las detecciones del contenedor de imagenes
    }

    setInterval(processFace, 1000); 

    requestAnimationFrame(reDraw);
}

main();

const nav = document.querySelector('#navhamb')

document.querySelector('#burger').addEventListener('click',(e) => {
  e.currentTarget.classList.toggle("active")
  nav.classList.toggle('show')
})