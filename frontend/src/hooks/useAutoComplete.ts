import { useState } from "react";
import { libraryStates, loadLibrary } from "./LibrarySearch";
import { useBook } from "../BookContext";

interface Library {
  state: string;
  libraryname: string;
}

export const useAutocomplete = () => {
  const { stateInput, setStateInput, libraryInput, setLibraryInput } = useBook();

  // State Input Logic
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Library Input Logic
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [filteredLibraries, setFilteredLibraries] = useState<Library[]>([]);

  const [stateError, setStateError] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  // Handle typing in State Input
  const handleStateInput = (value: string) => {
    setStateInput(value);
    setStateError(null);

    setHighlightedIndex(-1); // Reset highlight
    if (value.trim().length > 0) {
      const matches = libraryStates.filter((state) => state.toLowerCase().startsWith(value.toLowerCase()));
      setStateSuggestions(matches.slice(0, 5));
    } else {
      setStateSuggestions([]);
    }
  };

  // Handle State Selection
  const handleStateSelect = async (state: string) => {
    setStateInput(state);
    setStateError(null);

    setStateSuggestions([]);
    setLibraryInput("");
    setFilteredLibraries([]);

    const libraries = await loadLibrary(state);
    setLibraries(libraries);
  };

  const validateStateInput = () => {
    if (!libraryStates.includes(stateInput)) {
      setStateError("Please select a valid state.");
    }
  };

  // Handle typing in Library Input
  const handleLibraryInput = (value: string) => {
    setLibraryInput(value);
    setLibraryError(null);

    setHighlightedIndex(-1);
    if (value && libraries.length > 0) {
      const filtered = libraries.filter((lib) => lib.libraryname.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
      setFilteredLibraries(filtered);

    } else {
      setFilteredLibraries([]);
    }
  };

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent, listLength: number, onSelect: (index: number) => void) => {
    if (e.key === "ArrowDown" && listLength > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % listLength);
    } else if (e.key === "ArrowUp" && listLength > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? listLength - 1 : prev - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      onSelect(highlightedIndex);
    }
  };

  const validateLibraryInput = () => {
    const isValidLibrary = libraries.some((lib) => lib.libraryname.toLowerCase() === libraryInput.toLowerCase());
    if (!isValidLibrary) {
      setLibraryError("Please select a valid library.");
    }
  };

  return {
    stateInput,
    stateSuggestions,
    handleStateInput,
    handleStateSelect,
    libraryInput,
    filteredLibraries,
    handleLibraryInput,
    highlightedIndex,
    handleKeyDown,
    setFilteredLibraries,
    setStateSuggestions,
    validateStateInput,
    validateLibraryInput,
  };
};
