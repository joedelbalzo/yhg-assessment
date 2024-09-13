import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { BookType, PurchasedOrBorrowed, CodeJDB, EmailJDB, ContentMapJDB, ErrorMapJDB } from "./types";

interface BookContextType {
  currentContent: keyof ContentMapJDB;
  setCurrentContent: Dispatch<SetStateAction<keyof ContentMapJDB>>;
  bookType: BookType;
  setBookType: Dispatch<SetStateAction<BookType>>;
  purchasedOrBorrowed: PurchasedOrBorrowed;
  setPurchasedOrBorrowed: Dispatch<SetStateAction<PurchasedOrBorrowed>>;
  email: EmailJDB;
  setEmail: Dispatch<SetStateAction<EmailJDB>>;
  code: CodeJDB;
  setCode: Dispatch<SetStateAction<CodeJDB>>;
  uniqueURL: string;
  setUniqueURL: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  success: boolean;
  setSuccess: Dispatch<SetStateAction<boolean>>;
  isVerified: boolean;
  setIsVerified: Dispatch<SetStateAction<boolean>>;
  error: keyof ErrorMapJDB | undefined;
  setError: Dispatch<SetStateAction<keyof ErrorMapJDB | undefined>>;
  windowWidth: number;
  setWindowWidth: Dispatch<SetStateAction<number>>;
  handleCodeSubmission: (event: React.FormEvent<HTMLFormElement>) => void;
  setHandleCodeSubmission: Dispatch<SetStateAction<(event: React.FormEvent<HTMLFormElement>) => void>>;
}

export const BookContext = createContext<BookContextType>({} as BookContextType);

interface Props {
  children: ReactNode;
}

export const BookProvider: React.FC<Props> = ({ children }) => {
  const [bookType, setBookType] = useState<BookType>("");
  const [purchasedOrBorrowed, setPurchasedOrBorrowed] = useState<PurchasedOrBorrowed>("");
  const [email, setEmail] = useState<EmailJDB>("");
  // const [confirmEmail, setConfirmEmail] = useState<EmailJDB>("");
  const [code, setCode] = useState<CodeJDB>("");
  const [uniqueURL, setUniqueURL] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [currentContent, setCurrentContent] = useState<keyof ContentMapJDB>("physicalOrDigital");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [error, setError] = useState<keyof ErrorMapJDB | undefined>(undefined);
  const [handleCodeSubmission, setHandleCodeSubmission] = useState<(event: React.FormEvent<HTMLFormElement>) => void>(() => {});

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const debouncedHandleResize = debounce(handleResize, 200);
    window.addEventListener("resize", debouncedHandleResize);
    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, []);

  function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  return (
    <BookContext.Provider
      value={{
        bookType,
        setBookType,
        purchasedOrBorrowed,
        setPurchasedOrBorrowed,
        email,
        setEmail,
        code,
        setCode,
        uniqueURL,
        setUniqueURL,
        loading,
        setLoading,
        success,
        setSuccess,
        isVerified,
        setIsVerified,
        currentContent,
        setCurrentContent,
        error,
        setError,
        windowWidth,
        setWindowWidth,
        handleCodeSubmission,
        setHandleCodeSubmission,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

// Custom hook for using this context
export const useBook = () => useContext(BookContext);
