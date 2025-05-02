import React, { useState } from 'react'
import ModalWrapper from './ModalWrapper'
import { RiDeleteBin6Line } from "react-icons/ri";
import { LuImagePlus } from 'react-icons/lu';
import { toast } from 'react-toastify';

const ReportUserModal = ({ isOpen, onClose, onSuccess }) => {

    const [files, setFiles] = useState([])
    const [reason, setReason] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault();

        if (files.length < 1 && reason == "") return toast.error("form cannot be empty")
        // console.log({ viewer, topic, target });
        onSuccess({ reason, files, clearAll })
        // onClose();
      };

    const clearAll = () => {
        setFiles([])
        setReason("")
    }
      const handleDeepCLick = async (e) => {
        const inputTag = e.currentTarget.querySelector('input')
    
        // Ensure the input element is focused (even though it's invisible)
        inputTag.focus();
    
        inputTag.addEventListener('keydown', function (event) {
          event.preventDefault()
          if (event.key === 'Enter') {
            // Empty operation on Enter key press
          }
        });
    
        inputTag.click()
    }

    const fileAdd = (e) => {
        const newFiles = e.target.files
        setFiles(prev => [...prev, ...newFiles].slice(0, 3))
    }

    const handleSetFiles = (index) => {
        let newest

        if (index == 0 && files.length > 1) {
            newest = files.slice(1)
            // console.log(newest, "newest first")
        } else if (index == 0 && files.length == 1) {
            newest = []
        } else if (index < files.length - 1) {
            newest = [...(files.slice(0, index)), ...(files.slice(index + 1))]
            // console.log(newest, "newest third")
        } else if (index == files.length - 1) {
            // console.log(files, "newest fourth one")
            newest = files.slice(0, -1)
            // console.log(newest, "newest fourth")
        }
        // console.log(index, "jnjnhjnij")
        // console.log(files.length, "files.length")
        setFiles(prev => newest)
    }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
        <h2 className="text-xl mt-6">Report details</h2>
        <form action="" className="my-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="" className="block">Reason: <span className="text-red-500">*</span></label>
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} required className="border border-black rounded-md" />
            </div>
            <div className="flex flex-column gap-2 h-16 w-16">
                {/* <label htmlFor="" className="">Add files: </label> */}
                <div className="relative h-16 w-16 rounded-xl bg-[#d3e3fd] hover:bg-[#9bafd1]" onClick={handleDeepCLick}>
                    <div className="absolute top-0 left-0 flex justify-center items-center text-white w-full h-full rounded-xl text-[84px] cursor-pointer p-4">
                        <LuImagePlus color="#152136" />
                    </div>
                    <input onChange={fileAdd} type="file" accept='images/*' multiple required className="hidden" />
                </div>
            </div>
            <div className="flex overflow-x-auto min-w-full px-6 gap-6">
                {files?.map((file, index) => <>{renderFilePreview({file, index, handleSetFiles: handleSetFiles})}</>)}
            </div>
            <div className="flex justify-end">
                <button className="p-2 px-5 bg-orange-500 rounded-lg text-white" onClick={handleSubmit}>Complete</button>
            </div>
        </form>
    </ModalWrapper>
  )
}

export default ReportUserModal

const renderFilePreview = ({file, index, handleSetFiles = () => {}}) => {
    if (file.type.startsWith('image/')) {
      const objectURL = URL.createObjectURL(file);
      return (<div key={index} className='relative w-32 h-32'>
        <img src={objectURL} alt={file.name} className="w-full h-full object-cover rounded-md" />
        <RiDeleteBin6Line size={20} onClick={() => handleSetFiles(Number(index))} className='absolute top-2 right-2 cursor-pointer' />
      </div>)
    } else {
      return <p className="text-sm text-gray-600">{file.name}</p>;
    }
};
