import { useEffect, useState } from "react";
import { fetchMovies } from "../../services/movieService";
import SearchBar from "../SearchBar/SearchBar";
import css from "./App.module.css"
import type { Movie } from "../../types/movie";
import MovieGrid from "../MovieGrid/MovieGrid";
import toast, { Toaster } from 'react-hot-toast';
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import ReactPaginate from "react-paginate";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query.trim() !== "",
    placeholderData: keepPreviousData,
  })

  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
  if (data && data.results.length === 0) {
    toast.error("No movies found for your request.");
  }
  }, [data]);
    
  const handleSearch = async (query: string) => {
    setQuery(query);
    setPage(1);
  }

  const handleSelect = (movie: Movie) => { 
    setSelectedMovie(movie);
  };

  const handleClose = () => {
    setSelectedMovie(null);
  }
  
  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />
      {isSuccess && totalPages > 1 && <ReactPaginate
        pageCount={totalPages}
        pageRangeDisplayed={5}
        marginPagesDisplayed={1}
        onPageChange={({ selected }) => setPage(selected + 1)}
        forcePage={page - 1}
        containerClassName={css.pagination}
        activeClassName={css.active}
        nextLabel="→"
        previousLabel="←"
      />}
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      {
        isLoading
          ?
          <Loader />
          :
          isError
            ?
            <ErrorMessage />
            : 
            data?.results !== undefined && <MovieGrid onSelect={handleSelect} movies={data?.results} />
      }
      {selectedMovie !== null && <MovieModal onClose={handleClose} movie={selectedMovie }/>}
    </div>
  )
}