import { useState, type ReactNode, Children } from "react";

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  itemsPerPage?: number;
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  itemsPerPage = 10, // Default to 10 items per page
}: AccordionProps): ReactNode {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [currentPage, setCurrentPage] = useState(1);

  // Ensure children is an array of React nodes
  const childrenArray = Children.toArray(children);

  // Calculate pagination
  const totalPages = Math.ceil(childrenArray.length / itemsPerPage);
  const paginatedChildren = childrenArray.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-t-lg bg-gray-100 px-4 py-2 text-left text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        aria-expanded={isOpen}
        aria-controls="accordion-content"
      >
        <span className="font-medium">{title}</span>
        <svg
          className={`h-5 w-5 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        id="accordion-content"
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="bg-white px-4 py-2 dark:bg-gray-900">
          {/* Render paginated children */}
          {paginatedChildren}

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-between">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
