import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import Tesseract from "tesseract.js";
import "./PlateReader.css";
import { FaCamera } from 'react-icons/fa';

const PlateReader = ({ onPlateRecognized }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [error, setError] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setVideoStream(stream);
      setVideoReady(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Câmera ativada, stream:', stream);
      }
    } catch (err) {
      setError("Permissão da câmera negada ou não disponível.");
      console.error('Erro ao acessar a câmera:', err);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  const takePicture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      setError("Câmera não está pronta. Aguarde a imagem aparecer antes de capturar.");
      return;
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    stopCamera();
    await recognizePlate(imageData);
  };

  const recognizePlate = async (imageData) => {
    setIsLoading(true);
    setError("");
    try {
      const { data: { text } } = await Tesseract.recognize(imageData, "por", {
        logger: m => console.log(m)
      });
      const cleanedText = text.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (onPlateRecognized) {
        onPlateRecognized(cleanedText);
      }
    } catch (err) {
      setError("Erro ao processar OCR. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {error && <div className="error-text">{error}</div>}
      {isLoading && <div className="loading-text">Processando...</div>}
      {!videoStream && !isLoading && (
        <button
          className="plate-reader-icon-btn"
          onClick={startCamera}
          title="Ler Placa com Câmera"
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
        >
          <FaCamera size={38} color="#1976d2" />
        </button>
      )}
      {videoStream && !isLoading && (
        <>
          <video
            ref={videoRef}
            className="plate-reader-video"
            autoPlay
            playsInline
            style={{ marginBottom: 10, background: '#222' }}
            onLoadedMetadata={() => setVideoReady(true)}
          />
          {!videoReady && (
            <div style={{ color: '#d32f2f', marginBottom: 8 }}>
              Aguardando câmera carregar...
            </div>
          )}
          <button className="plate-reader-button" onClick={takePicture} disabled={!videoReady}>
            Capturar Placa
          </button>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

PlateReader.propTypes = {
  onPlateRecognized: PropTypes.func.isRequired,
};

export default PlateReader; 