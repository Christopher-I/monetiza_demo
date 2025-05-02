import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
} from '@tanstack/react-table';
import { useTable, usePagination } from 'react-table';
import { useNavigate } from 'react-router-dom';

const ContentTable = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title',
      },
      {
        Header: 'Content type',
        accessor: 'contentType',
      },
      {
        Header: 'Published Status',
        accessor: 'status',
      },
      {
        Header: 'Operations',
        accessor: 'operations',
        Cell: ({ row }) => (
           <select className="p-2 border rounded-md bg-gray-200 cursor-pointer">
                <option>Edit</option>
                <option>Delete</option>
          </select>
        ),
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 5 },
    },
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = tableInstance;

  const undefinedKey = {key: undefined}

  return (
    <div className="border rounded-lg p-4">
      <table {...getTableProps()} className="w-full text-left border-collapse">
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={index.toString()}>
              {headerGroup.headers.map((column, index) => (
                <th {...column.getHeaderProps()} key={index.toString()} className="p-3 border bg-orange-100">
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row, index) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={index.toString()}  className="hover:bg-gray-50">
                {row.cells.map((cell, index) => (
                  <td {...cell.getCellProps()} key={index.toString()} className="p-3 border">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="p-2 border rounded-md bg-gray-100 disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>

        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className="p-2 border rounded-md bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const ContentManagement = ({initialData}) => {
  const navigate = useNavigate()
    const [data, setData] = useState(() => initialData);
  const [filters, setFilters] = useState({
    title: '',
    contentType: '',
    status: '',
  });

  // Table Columns
  const columns = useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'caption',
        // Cell: (data) => (
        //   <span className={``}>{data && (String(data).split("<p>")[0]).split("</p>")[0]}</span>
        // ),
      },
      {
        Header: 'Content type',
        accessor: 'image',
        Cell: (data) => {
          // console.log(data, "content type")
          return(
          <span className={``}>{(data.row.original.image) ? "Media" : "Text"}</span>
        )},
      },
      {
        Header: 'Published Status',
        accessor: 'status',
        Cell: (data) => (
          <span className={`${new Date(data.row.original.publishedAt) > Date.now() ? "text-red-400" : "text-green-400"}`}>{new Date(data.row.original.publishedAt) > Date.now() ? "Not Published" : "Published"}</span>
        ),
      },
      {
        Header: 'Operations',
        accessor: 'operations',
        Cell: ({row}) => (
          <select className="p-2 border rounded-md bg-white cursor-pointer border border-black" onClick={() => new Date(row.original.publishedAt) > Date.now() && navigate(`/content/${row.original._id}`)}>
              {new Date(row.original.publishedAt) > Date.now() ? (
                <option>Edit</option>
              ) : (
                <option disabled>____</option>
              )}
              {/* <option>Edit</option> */}
              {/* <option>Delete</option> */}
          </select>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    // 
    setData(() => initialData)
  }, [initialData])
  

  // console.log(initialData, "deeper")
  // console.log(data, "deeper data")

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 20 },
    },
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = tableInstance;

  // Filter Handler
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    let filteredData = initialData;

    if (filters.title) {
      filteredData = filteredData.filter((item) =>
        item.caption.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    if (filters.contentType) {
      filteredData = filteredData.filter(
        (item) => filters.contentType == "Media" ? !!item.image : filters.contentType == "Post" ? !item.image : true
      );
    }

    if (filters.status) {
      filteredData = filteredData.filter(
        (item) => filters.status == "Published" ? new Date(item.publishedAt) < Date.now() : filters.status == "Not Published" ? new Date(item.publishedAt) > Date.now() : true
      );
    }

    setData(filteredData);
  };

  return (
    <div className="pt-4">

      {/* Add Content Button */}
      <div className="flex justify-between items-center mb-6">
        <button className="p-2 px-4 bg-orange-500 text-white rounded-md" onClick={() => navigate("new")}>
          + Add Content
        </button>
      </div>

      {/* Filter Section */}
      <div className="border rounded-md p-4 mb-6 grid grid-cols-3 gap-4 shadow-lg">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={filters.title}
          onChange={handleFilterChange}
          className="p-2 border rounded-md"
        />
        <select
          name="contentType"
          value={filters.contentType}
          onChange={handleFilterChange}
          className="p-2 border rounded-md"
        >
          <option value="">Content type</option>
          <option value="Media">Media</option>
          <option value="Post">Post</option>
        </select>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="p-2 border rounded-md"
        >
          <option value="">Published Status</option>
          <option value="Published">Published</option>
          <option value="Not Published">Not Published</option>
        </select>
        <div className="col-span-3 flex justify-end">
          <button
            onClick={applyFilters}
            className="p-2 px-6 bg-gray-300 rounded-md text-sm"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-lg p-4">
        <table
          {...getTableProps()}
          className="w-full text-left"
        >
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index.toString()}>
                {headerGroup.headers.map((column, index) => (
                  <th
                    {...column.getHeaderProps()}
                    key={index.toString()}
                    className="p-3 bg-[#E35F0180]"
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {page.map((row, index) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  key={index.toString()}
                  className="hover:bg-gray-50"
                >
                  {row.cells.map((cell, index) => (
                    <td {...cell.getCellProps()} key={index.toString()} className="p-3">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="p-2 border rounded-md bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>
          </span>

          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="p-2 border rounded-md bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

  
  const defaultData = [
    {
      firstName: 'tanner',
      lastName: 'linsley',
      age: 24,
      visits: 100,
      status: 'In Relationship',
      progress: 50,
    },
    {
      firstName: 'tandy',
      lastName: 'miller',
      age: 40,
      visits: 40,
      status: 'Single',
      progress: 80,
    },
    {
      firstName: 'joe',
      lastName: 'dirte',
      age: 45,
      visits: 20,
      status: 'Complicated',
      progress: 10,
    },
  ]
  
  const columnHelper = createColumnHelper()
  
  const columns = [
    columnHelper.accessor('firstName', {
      cell: info => info.getValue(),
      footer: info => info.column.id,
    }),
    columnHelper.accessor(row => row.lastName, {
      id: 'lastName',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Last Name</span>,
      footer: info => info.column.id,
    }),
    columnHelper.accessor('age', {
      header: () => 'Age',
      cell: info => info.renderValue(),
      footer: info => info.column.id,
    }),
    columnHelper.accessor('visits', {
      header: () => <span>Visits</span>,
      footer: info => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      footer: info => info.column.id,
    }),
    columnHelper.accessor('progress', {
      header: 'Profile Progress',
      footer: info => info.column.id,
    }),
  ]
  
  export function SecondContentTable() {
    const [data, _setData] = React.useState(() => [...defaultData])
    const rerender = React.useReducer(() => ({}), {})[1]
  
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })
  
    return (
      <div className="p-2">
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            {table.getFooterGroups().map(footerGroup => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
        <div className="h-4" />
        <button onClick={() => rerender()} className="border p-2">
          Rerender
        </button>
      </div>
    )
  }

export default ContentTable;