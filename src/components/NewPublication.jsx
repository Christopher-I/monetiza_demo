// newPublication.jsx

import MessageBox from "./MessageBox";

const NewPublication = ({refetchAllPosts}) => {
  return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4 p-4 border-b border-[var(--border-color)]">
          <h2 className="font-montserrat text-lg font-semibold">New Publication</h2>
          <button className="font-montserrat bg-[var(--main-color)] text-white px-4 py-1 rounded-full hover:bg-orange-600">
            Post
          </button>
        </div>
        <div className="w-full px-4">

        <MessageBox refetchAllPosts={refetchAllPosts} />
        </div>
      </div>
  );
};

export default NewPublication;
