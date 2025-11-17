import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { assets } from '@/assets';
import Image from 'next/image';
import { gradientArray } from '../gradientColors';
import classNames from 'classnames';

import { SketchPicker } from 'react-color';

import { useDispatch } from 'react-redux';
import { useAmplitude } from '@/provider/Amplitude';
import { debounce } from '@/utils/common';

const fontFamlies = [
  'Beirut',
  'IBM Plex Serif',
  'Libre Baskerville',
  'Sacramento',
  'Mr Dafoe',
  'Corinthia',
  'Caveat',
  'Barlow Condensed',
  'Montserrat',
  'Playwrite CU',
  'MessinaSans',
];

const CanvasContainer = ({
  image,
  gradientImage,
  setFinalData,
  isAddToText,
  index,
  editMode,
  setEditMode,
  // setIndex,
}) => {
  const dispatch = useDispatch();
  const { trackEvent } = useAmplitude();

  const { editor, onReady } = useFabricJSEditor({
    scaleStep: 1,
  });
  const [textList, setTextList] = useState([]);
  const [isShowColors, setIsShowColors] = useState(false);
  const textListRef = useRef(textList);
  const [reload, setReload] = useState(false);
  const [textAdded, setTextAdded] = useState(false);
  const [selectFont, setSelectFont] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Libre Baskerville');
  const [done, setDone] = useState(false);
  const [bg, setBg] = useState(false);
  const [activeAlign, setActiveAlign] = useState('left');

  const [color, setColor] = useState('#FFFFFF');
  const [showPicker, setShowPicker] = useState(false);

  const toggleFonts = () => {
    setSelectFont(!selectFont);
    setIsShowColors(false);
  };

  const handleTextAlign = () => {
    if (activeObject) {
      const align = activeObject.textAlign;
      let newAlign = align;
      if (align === 'left') {
        activeObject.set({ textAlign: 'center' });
        setActiveAlign('center');
        newAlign = 'center';
      } else if (align === 'center') {
        activeObject.set({ textAlign: 'right' });
        setActiveAlign('right');
        newAlign = 'right';
      } else {
        activeObject.set({ textAlign: 'left' });
        setActiveAlign('left');
        newAlign = 'left';
      }
      editor.canvas.renderAll();
      trackEvent('text_alignment_changed', {
        text_alignment: newAlign,
      });
    }
  };

  useEffect(() => {
    textListRef.current = textList;
  }, [textList]);

  useEffect(() => {
    if (editor) {
      editor.canvas.viewportTransform = [1, 0, 0, 1, 0, 0]; // Reset any transformations
      editor.canvas.setZoom(1); // Lock zoom level
    }
    if (editor && !editMode && !done) {
      editor.canvas.on('mouse:down', options => {
        if (!editMode) {
          if (index === gradientArray.length - 1) {
            dispatch.nft.setIndex(0);
          } else {
            dispatch.nft.setIndex(index + 1);
          }
          trackEvent('photo_tap_to_change_filter', {
            photo_tapped: true,
          });
        }
      });
      // editor.canvas.on('text:editing:entered', function (e) {
      //   if (e.target.type === 'i-text') {
      //     e.target.scaleX = 0.5;
      //     e.target.scaleY = 0.5;
      //     e.target.setCoords();
      //     editor.canvas.renderAll();
      //   }
      // });

      // editor.canvas.on('text:editing:exited', function (e) {
      //   if (e.target.type === 'i-text') {
      //     e.target.scaleX = 1;
      //     e.target.scaleY = 1;
      //     e.target.setCoords();
      //     editor.canvas.renderAll();
      //   }
      // });
    }
    return () => {
      if (editor) {
        editor.canvas.off('mouse:down');
      }
    };
  }, [editor, editMode, index, done]);

  useEffect(() => {
    if (image) {
      editor.canvas.clear();
      getScreenShot(image, gradientImage);
    }
  }, [image, textList, index]);

  const getScreenShot = async (img, gradient) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const imageSrc = img;
    const image = document.createElement('img');
    image.src = imageSrc;

    const gradientImageSrc = gradientArray[index];
    const gradientImage = document.createElement('img');
    gradientImage.src = gradientImageSrc;

    editor.canvas.setWidth(363);
    editor.canvas.setHeight(363);
    editor.canvas.setZoom(1);

    image.onload = async function () {
      // Set canvas dimensions to match the image
      canvas.width = 363;
      canvas.height = 363;

      // Draw the image centered on the canvas
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      // #ffffff99
      ctx.fillStyle = '#ffffffa6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply grayscale filter to the first image
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const grayscale = 0.3 * red + 0.3 * green + 0.3 * blue;
        data[i] = grayscale;
        data[i + 1] = grayscale;
        data[i + 2] = grayscale;
      }

      ctx.putImageData(imageData, 0, 0);

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2.3,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.clip(); // Clip to circle
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const gradientCanvas = document.createElement('canvas');
      const gradientCtx = gradientCanvas.getContext('2d');
      gradientCanvas.width = canvas.width;
      gradientCanvas.height = canvas.height;

      // Draw the gradient image
      gradientCtx.drawImage(
        gradientImage,
        0,
        0,
        gradientCanvas.width,
        gradientCanvas.height
      );

      // Create radial gradient mask
      const radialGradient = gradientCtx.createRadialGradient(
        gradientCanvas.width / 2,
        gradientCanvas.height / 2,
        0,
        gradientCanvas.width / 2,
        gradientCanvas.height / 2,
        gradientCanvas.width / 2.3
      );

      gradientCtx.fillStyle = radialGradient;
      gradientCtx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);

      //   ctx.globalCompositeOperation = 'destination-in';
      ctx.globalCompositeOperation = 'color';
      // ctx.filter = 'blur(130px)';
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2.3,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.clip(); // Clip to circle
      ctx.drawImage(gradientImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.drawImage(gradientCanvas, 0, 0);
      ctx.restore();

      const finalImgUrl = canvas.toDataURL();

      fabric.Image.fromURL(finalImgUrl, img => {
        img.set({
          left: 0,
          top: 0,
          scaleX: 363 / img.width,
          scaleY: 363 / img.height,
          selectable: false, // Make the image static
        });
        editor.canvas.add(img);

        setTimeout(async () => {
          captureScreenshot();
        }, 500);
      });
    };

    gradientImage.onload = function () {
      // Initiate the image processing when the gradient image is loaded
      image.onload();
    };
  };

  const captureScreenshot = () => {
    // Get the data URL of the canvas content
    const originalBackgroundColor = editor.canvas.backgroundColor;

    // Set the canvas background to white
    editor.canvas.setBackgroundColor('white', () => {
      // Render the canvas to apply the background color
      editor.canvas.renderAll();

      // Get the data URL of the canvas content

      // Create an image element to display the screenshot
      // const img = document.createElement('img');
      // img.src = dataURL;
      // document.body.appendChild(img); // Add the image to the document

      // Reset the background color to its original value
      editor.canvas.setBackgroundColor(originalBackgroundColor, () => {
        editor.canvas.renderAll();

        const dataURL = editor.canvas.toDataURL({
          format: 'png', // Specify the format (e.g., 'png', 'jpeg')
          multiplier: 1320 / 363,
        });
        setFinalData(dataURL);
      });
    });
  };

  const activeObject = editor?.canvas?.getActiveObject();

  const colorsArray = [
    '#FFFFFF',
    '#000000',
    '#D4EBFF',
    '#0071A4',
    '#030A74',
    '#3634A3',
    '#8944AB',
    '#D30F85',
    '#D70015',
    '#CEB55A',
    '#248A3D',
    '#1C1C1E',
    '#2C2C2E',
    '#3A3A3C',
    '#48484A',
    '#636366',
    '#8E8E93',
    '#AEAEB2',
    '#C7C7CC',
    '#D1D1D6',
    '#E5E5EA',
    '#F2F2F7',
  ];

  //   useEffect(() => {
  //     if (!editMode) {
  //       if (activeObject) {
  //         activeObject.selectable = false;
  //         activeObject.evented = false;
  //         editor?.canvas.renderAll();
  //       }
  //     }
  //   }, [editMode]);

  const handleTextSize = useCallback(
    debounce(val => {
      trackEvent('text_size_changed', {
        text_size: val,
      });
    }, 100),
    []
  );

  useEffect(() => {
    if (activeObject && !editMode) {
      setEditMode(true);
    }
  }, [activeObject]);

  useEffect(() => {
    if (isAddToText && !textAdded) {
      if (!isAddToText) return;

      if (textAdded) return;

      fabric.IText.prototype.editable = false;

      const text = new fabric.IText('', {
        left: 363 / 2,
        top: 363 / 2,
        fontSize: 18,
        fill: colorsArray[0],
        id: 0,
        backgroundColor: 'transparent',
        selectable: true,
        lockRotation: false,
        lockScalingX: true,
        lockScalingY: true,
        scaleX: 1,
        scaleY: 1,
        hasRotatingPoint: false,
        padding: 10,
        fontFamily: fontFamlies[2],
        editable: true,
        selectable: true,
        borderRadius: '10px',
      });

      text.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        bl: false,
        br: false,
        tl: false,
        tr: false,
        mtr: true,
      });
      text.enterEditing();
      text._renderBackground = function (ctx) {
        if (!this.backgroundColor) return;

        ctx.save();
        ctx.fillStyle = this.backgroundColor;

        const width = this.width + this.padding * 2;
        const height = this.height + this.padding * 2;

        // Draw rounded rectangle
        const radius = 13; // Adjust the radius to get the desired roundness
        ctx.beginPath();
        ctx.moveTo(-width / 2 + radius, -height / 2);
        ctx.lineTo(width / 2 - radius, -height / 2);
        ctx.quadraticCurveTo(
          width / 2,
          -height / 2,
          width / 2,
          -height / 2 + radius
        );
        ctx.lineTo(width / 2, height / 2 - radius);
        ctx.quadraticCurveTo(
          width / 2,
          height / 2,
          width / 2 - radius,
          height / 2
        );
        ctx.lineTo(-width / 2 + radius, height / 2);
        ctx.quadraticCurveTo(
          -width / 2,
          height / 2,
          -width / 2,
          height / 2 - radius
        );
        ctx.lineTo(-width / 2, -height / 2 + radius);
        ctx.quadraticCurveTo(
          -width / 2,
          -height / 2,
          -width / 2 + radius,
          -height / 2
        );
        ctx.closePath();

        ctx.fill();
        ctx.restore();
      };
      editor.canvas.setActiveObject(text);
      editor.canvas.add(text);
      // editor.canvas.setHeight(1320);
      // editor.canvas.setWidth(1320);
      editor.canvas.renderAll();
      setTextAdded(true);
      setEditMode(true);
      editor.canvas.viewportTransform = [1, 0, 0, 1, 0, 0]; // Reset any transformations
      editor.canvas.setZoom(1);
      setSelectFont(fontFamlies[2]);

      // text.on('editing:entered', () => {
      //   editor.canvas.setHeight(1320);
      //   editor.canvas.setWidth(1320);
      //   // Your custom code here to handle focus event
      //   // For example, prevent default touch behavior on mobile
      //   text.canvas.wrapperEl.style.touchAction = 'none'; // Prevents zoom on iOS

      //   // Alternative: Disable zooming on mobile when editing
      //   document.documentElement.style.setProperty('overflow', 'hidden');
      // });

      // // Handle the 'editing:exited' event (triggers when the IText object loses focus)
      // text.on('editing:exited', () => {
      //   editor.canvas.setHeight(1320);
      //   editor.canvas.setWidth(1320);
      //   // Your custom code here to handle blur event
      //   // Re-enable zoom behavior if needed
      //   text.canvas.wrapperEl.style.touchAction = ''; // Reset to default behavior

      //   // Alternative: Re-enable zoom on mobile after editing
      //   document.documentElement.style.setProperty('overflow', '');
      // });

      // text.on('selected', () => {
      //   editor.canvas.setHeight(1320);
      //   editor.canvas.setWidth(1320);
      //   // Handle selection event here
      // });
      // text.on('text:changed', () => {
      //   editor.canvas.setHeight(1320);
      //   editor.canvas.setWidth(1320);
      //   // Handle text change here
      // });
      // text.on('object:modified', () => {
      //   alert('change');
      //   editor.canvas.setHeight(1320);
      //   editor.canvas.setWidth(1320);
      //   // Handle the modification, including text changes
      // });
      // setReload(!reload);
      // const nditor.canvas.setActiveObject(text);
      // editor.cewTextArray = [...textList]
      // newTextArray.push({ top: 100, left: 100, value: 'Text here', color: colorsArray[0], backgroundColor: 'transparent', fontSize: 20 })
      // setTextList(newTextArray)
      // setEditMode(true)
    }
  }, [isAddToText]);

  useEffect(() => {
    if (activeObject) {
      window.scrollTo({
        left: 0,
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [activeObject]);

  return (
    <>
      <div
        className={` relative  rounded-[30px] ${
          editMode
            ? 'bg-[#707070] !w-[363px] !h-[363px] !aspect-square'
            : 'bg-[#fff] !w-[363px] !h-[363px] '
        }`}
      >
        <FabricJSCanvas
          id='canvas'
          className='canvas-container rounded-[20px] bg-white overflow-hidden !aspect-square'
          onReady={onReady}
        />

        {editMode && (
          <div
            className='absolute right-3 top-3 text-black font-[775] text-[15px] leading-[19px] cursor-pointer z-30 w-[57px] h-[35px] bg-[#F2F2F7] rounded-full grid place-items-center border-2 border-white'
            onClick={async () => {
              setEditMode(false);
              captureScreenshot();
              setDone(true);
              if (activeObject && activeObject.type === 'i-text') {
                const text = activeObject.text;
                trackEvent('text_added', {
                  added_text: text,
                });
              }
              trackEvent('text_add_enabled');
              trackEvent('continue_to_review_button_enabled', {
                button_enabled: true,
              });

              // setFinalData(data)
            }}
          >
            <span className='text-inherit text-[13px]'>Done</span>
          </div>
        )}

        {/* {isAddToText && !textAdded && (
          <div
            className='rounded-[50%] bg-[#959595] z-10 flex items-center justify-center cursor-pointer font-[Beirut] w-[40px] h-[40px] absolute bottom-3 right-3'
            onClick={() => {
              if (!isAddToText) return;

              if (textAdded) return;

              const text = new fabric.IText('', {
                left: 100,
                top: 150,
                fontSize: 18,
                fill: colorsArray[0],
                editable: true,
                id: 0,
                backgroundColor: 'transparent',
                selectable: true,
                lockRotation: false,
                lockScalingX: true,
                lockScalingY: true,
                hasRotatingPoint: false,
                padding: 10,
                // fontFamily: 'Beirut',
                editMode: true,
              });

              text.setControlsVisibility({
                mt: false,
                mb: false,
                ml: false,
                mr: false,
                bl: false,
                br: false,
                tl: false,
                tr: false,
                mtr: true,
              });

              editor.canvas.setActiveObject(text);
              editor.canvas.add(text);
              editor.canvas.renderAll();
              setTextAdded(true);
              setEditMode(true);

              // setReload(!reload);
              // const nditor.canvas.setActiveObject(text);
              // editor.cewTextArray = [...textList]
              // newTextArray.push({ top: 100, left: 100, value: 'Text here', color: colorsArray[0], backgroundColor: 'transparent', fontSize: 20 })
              // setTextList(newTextArray)
              // setEditMode(true)
            }}
          >
            Aa
          </div>
        )} */}
      </div>
      {activeObject && editMode && (
        <div className='flex gap-3 items-center relative'>
          <div className='range-wrapper'>
            <input
              onChange={e => {
                activeObject.set('fontSize', e.target.value);
                editor.canvas.renderAll();
                handleTextSize(e.target.value);
              }}
              type='range'
              min={18}
              max={50}
              defaultValue={activeObject?.fontSize || 18}
            />
            <div className='input'></div>
          </div>
          <Image
            src={`/${activeAlign}.svg`}
            width={24}
            height={24}
            onClick={handleTextAlign}
            alt=''
          />
          <Image
            className='cursor-pointer'
            onClick={() => {
              if (!bg) {
                activeObject.set({
                  backgroundColor: '#000000',
                });
                editor.canvas.renderAll();
              } else {
                activeObject.set({
                  backgroundColor: 'transparent',
                });
                editor.canvas.renderAll();
              }
              setBg(!bg);
              // const backgroundColor = activeObject.backgroundColor;
              // let bgColor = '';
              // let textColor = activeObject.fill;
              // if (backgroundColor === 'transparent') {
              //   bgColor = '#000000';
              //   if (activeObject.fill === bgColor) {
              //     textColor = '#FFFFFF';
              //   }
              // } else if (backgroundColor === '#000000') {
              //   bgColor = '#FFFFFF';
              //   if (activeObject.fill === bgColor) {
              //     textColor = '#000000';
              //   }
              // } else {
              //   bgColor = 'transparent';
              // }
            }}
            src={bg ? '/text-block-filled.svg' : '/text-block.svg'}
            width={24}
            height={24}
            alt=''
          />
          {selectFont ? (
            <Image
              className='cursor-pointer'
              onClick={() => {
                setIsShowColors(!isShowColors);
                setSelectFont(false);
              }}
              src={assets.colors}
              alt=''
            />
          ) : (
            <Image
              className='cursor-pointer'
              onClick={() => {
                setIsShowColors(!isShowColors);
                setSelectFont(true);
              }}
              src={'/Aa-editor.svg'}
              width={24}
              height={20}
              alt=''
            />
          )}

          {isShowColors && (
            <div className='absolute overflow-auto flex items-center gap-6 cursor-pointer top-[-45px] z-20 w-full px-10  overflow-x-auto no-scroll-bar'>
              <div
                className={classNames(
                  'min-w-[14px] h-[14px] rounded-full grid place-items-center',
                  `${
                    !colorsArray.includes(color) &&
                    `min-w-[25px] h-[25px] border-2 border-white`
                  }`
                )}
                style={{ background: color }}
                onClick={() => setShowPicker(true)}
              >
                {!colorsArray.includes(color) ? (
                  <Image src='pick.svg' width={13} height={13} alt='' />
                ) : (
                  <Image src='grad.svg' width={14} height={14} alt='' />
                )}
              </div>
              {colorsArray.map((color, index) => (
                <span
                  key={index}
                  style={{
                    minWidth: bg
                      ? activeObject.backgroundColor === color
                        ? '25px'
                        : '12px'
                      : activeObject.fill === color
                      ? '25px'
                      : '12px',
                    minHeight: bg
                      ? activeObject.backgroundColor === color
                        ? '25px'
                        : '12px'
                      : activeObject.fill === color
                      ? '25px'
                      : '12px',
                    border: bg
                      ? activeObject.backgroundColor === color
                        ? '2px solid #FFFFFF'
                        : '1.25px solid #ffffff'
                      : activeObject.fill === color
                      ? '2px solid #FFFFFF'
                      : '1.25px solid #ffffff',
                    background: color,
                    borderRadius: '50%',
                  }}
                  onClick={() => {
                    setColor(color);
                    if (bg) {
                      activeObject.set({ backgroundColor: color });
                      trackEvent('background_color_changed', {
                        background_color: color,
                      });
                      editor.canvas.renderAll();
                      setReload(!reload);
                    } else {
                      activeObject.set({ fill: color });
                      trackEvent('text_color_changed', {
                        text_color: color,
                      });
                      editor.canvas.renderAll();
                      setReload(!reload);
                    }
                  }}
                ></span>
              ))}
            </div>
          )}
          {selectFont && (
            <div className='absolute overflow-auto flex items-center gap-[15px] cursor-pointer top-[-50px] z-20 w-full px-5 justify-center overflow-x-auto no-scroll-bar'>
              {[
                'Beirut',
                'IBM Plex Serif',
                'Libre Baskerville',
                'Sacramento',
                'Mr Dafoe',
                'Corinthia',
                'Caveat',
                'Barlow Condensed',
                'Montserrat',
                'Playwrite CU',
                'MessinaSans',
              ].map(f => (
                <div
                  key={f}
                  className={classNames(
                    'bg-black min-w-[35px] min-h-[35px] rounded-full grid place-items-center',
                    selectedFont === f
                      ? '!bg-white !text-black'
                      : 'bg-black text-white opacity-25'
                  )}
                  style={{ fontFamily: f }}
                  onClick={() => {
                    activeObject.set({ fontFamily: f });
                    editor.canvas.renderAll();
                    setReload(!reload);
                    setSelectedFont(f);
                  }}
                >
                  Aa
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showPicker && (
        <div className='flex justify-center items-center absolute top-0 left-0 w-full h-full  z-30 overflow-hidden'>
          <div className='bg-white'>
            <SketchPicker
              color={color}
              onChange={c => {
                setColor(c.hex);
                if (bg) {
                  activeObject.set({ backgroundColor: color });
                } else {
                  activeObject.set({ fill: color });
                }
                editor.canvas.renderAll();
              }}
              styles={{
                default: {
                  picker: {
                    boxShadow: 'none',
                  },
                },
              }}
            />
            <div className='w-full p-2'>
              <button
                className='w-full text-[#01032C] h-[35px] text-sm border border-[#4898F3] rounded-3xl'
                onClick={() => {
                  setShowPicker(false);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CanvasContainer;
