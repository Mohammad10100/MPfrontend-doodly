import React, { useRef, useEffect } from 'react';
import './Canvas.css';
import ReplayIcon from '@mui/icons-material/Replay';


const Canvas = ({socket}) => {
  const canvasRef = useRef(null);
  const colorsRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {

    // --------------- getContext() method returns a drawing context on the canvas-----
    const clearCanvas = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clear'); 
      };
  
      const clearButton = document.getElementById('clear-button');
      clearButton.addEventListener('click', clearCanvas);
  
      const onClearEvent = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
      };
      socket.on('clear', onClearEvent);

    const canvas = canvasRef.current;
    const test = colorsRef.current;
    const context = canvas.getContext('2d');

    // ----------------------- Colors --------------------------------------------------

    const colors = document.getElementsByClassName('color');
    console.log(colors, 'the colors');
    console.log(test);
    // set the current color
    const current = {
      color: 'black',
    };
    const onColorUpdate = (e) => {
      current.color = e.target.className.split(' ')[1];
    };
    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener('click', onColorUpdate, false);
    }
    let drawing = false;

    // ------------------------------- create the drawing ----------------------------

    const drawLine = (x0, y0, x1, y1, color, emit) => {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      if (!emit) { return; }
      const w = canvas.width;
      const h = canvas.height;

      socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
      });
    };

    // ---------------- mouse movement --------------------------------------

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseMove = (e) => {
      if (!drawing) { return; }
      drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseUp = (e) => {
      if (!drawing) { return; }
      drawing = false;
      drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    };

    // ----------- limit the number of events per second -----------------------

    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function() {
        const time = new Date().getTime();

        if ((time - previousCall) >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };

    // -----------------add event listeners to our canvas ----------------------

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

    // Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    // -------------- make the canvas fill its parent component -----------------

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', onResize, false);
    onResize();

    // ----------------------- socket.io connection ----------------------------
    const onDrawingEvent = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }
    socket.on('drawing', onDrawingEvent);
  }, []);

  // ------------- The Canvas and color elements --------------------------

  return (
    <div>
      <canvas ref={canvasRef} className="whiteboard bg-white" />

      <div ref={colorsRef} className="colors absolute bottom-0 flex gap-[1rem] flex-wrap m-[1rem]">
        <div className="color black rounded-full" />
        <div className="color red rounded-full" />
        <div className="color green rounded-full" />
        <div className="color blue rounded-full" />
        <div className="color yellow rounded-full" />
        <div className="color white rounded-full" />
        <button id="clear-button" className='rounded-full bg-gray-200 h-[48px] w-[48px]'><ReplayIcon/></button>
      </div>
    </div>
  );
};

export default Canvas;