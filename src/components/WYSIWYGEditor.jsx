import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const WYSIWYGEditor = ({content, setContent}) => {
  // const [content, setContent] = useState('');

  const handleChange = (value) => {
    setContent(value);
  };

  const modules = {
    toolbar: [
    //   [{ header: [1, 2, false] }],
    //   ['bold', 'italic', 'underline', 'strike'],
      ['bold', 'italic',],
    //   ['blockquote', 'code-block'],
    //   [{ list: 'ordered' }, { list: 'bullet' }],
    //   [{ script: 'sub' }, { script: 'super' }],
    //   [{ indent: '-1' }, { indent: '+1' }],
    //   [{ direction: 'rtl' }],
    //   [{ color: [] }, { background: [] }],
    //   [{ font: [] }],
    //   [{ align: [] }],
    //   ['link', 'image', 'video'],
      ['link',],
      ['emoji',],
    //   ['clean'],
    ],
  };

  return (
    <div className="rounded-lg h-44 text-sm">
      <ReactQuill 
        value={content} 
        onChange={handleChange} 
        modules={modules}
        className="h-32 rounded-lg text-xs"
        theme='snow'
      />
    </div>
  );
};

export default WYSIWYGEditor;