import React from "react";
import { Pagination } from "react-bootstrap";

const OurPagination = ({
  activePage = 1,
  updateActivePage,
  totalPages = 10,
  testId = "OurPagination",
}) => {
  const nextPage = () => {
    const newPage = Math.min(activePage + 1, totalPages);
    updateActivePage(newPage);
  };
  const prevPage = () => {
    const newPage = Math.max(activePage - 1, 1);
    updateActivePage(newPage);
  };
  const thisPage = (page) => {
    updateActivePage(page);
  };

  const pageButton = (number) => (
    <Pagination.Item
      key={number}
      active={number === activePage}
      onClick={() => thisPage(number)}
      data-testid={`${testId}-${number}`}
    >
      {number}
    </Pagination.Item>
  );

  const generateSimplePaginationItems = () =>
    Array.from({ length: totalPages }, (_, index) => pageButton(index + 1));

  const generateComplexPaginationItems = () => {
    let middleItems;

    // Case 1: activePage is near the beginning (1, 2, 3, 4)
    if (activePage < 5) {
      middleItems = [
        pageButton(2),
        pageButton(3),
        pageButton(4),
        pageButton(5),
        <Pagination.Ellipsis
          key="right-ellipsis"
          data-testid={`${testId}-right-ellipsis`}
        />,
      ];
    }
    // Case 2: activePage is near the end (totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    else if (activePage > totalPages - 4) {
      middleItems = [
        <Pagination.Ellipsis
          key="left-ellipsis"
          data-testid={`${testId}-left-ellipsis`}
        />,
        pageButton(totalPages - 4),
        pageButton(totalPages - 3),
        pageButton(totalPages - 2),
        pageButton(totalPages - 1),
      ];
    }
    // Case 3: activePage is in the middle
    else {
      middleItems = [
        <Pagination.Ellipsis
          key="left-ellipsis"
          data-testid={`${testId}-left-ellipsis`}
        />,
        pageButton(activePage - 1),
        pageButton(activePage),
        pageButton(activePage + 1),
        <Pagination.Ellipsis
          key="right-ellipsis"
          data-testid={`${testId}-right-ellipsis`}
        />,
      ];
    }

    return [pageButton(1), ...middleItems, pageButton(totalPages)];
  };

  const generatePaginationItems = () =>
    totalPages <= 7
      ? generateSimplePaginationItems()
      : generateComplexPaginationItems();

  return (
    <Pagination>
      <Pagination.Prev onClick={prevPage} data-testid={`${testId}-prev`} />
      {generatePaginationItems()}
      <Pagination.Next onClick={nextPage} data-testid={`${testId}-next`} />
    </Pagination>
  );
};

export default OurPagination;
