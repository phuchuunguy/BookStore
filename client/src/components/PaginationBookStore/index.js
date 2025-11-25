import { memo } from "react"
import { Pagination } from "react-bootstrap"
function PaginationBookStore({totalPage, currentPage, onChangePage}) {
    let items = []

    if (currentPage > 1) {
        items.push(<Pagination.Prev key="prev" onClick={() => onChangePage(currentPage -1)} />)
    }
    for (let page = 1; page <= totalPage; page++) {
        items.push(
            <Pagination.Item onClick={() => onChangePage(page)} key={page} active={page === currentPage}>
                {page}
            </Pagination.Item>,
        )
    }

    if (currentPage < totalPage) {
        items.push(<Pagination.Next key="next" onClick={() => onChangePage(currentPage + 1)} />)
    }
  
    return (
        <Pagination>{items}</Pagination>
    )
}

export default memo(PaginationBookStore)