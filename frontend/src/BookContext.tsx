import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { BookType, PurchasedOrBorrowed, ContentMapJDB } from "./types";

interface BookContextType {
  currentContent: keyof ContentMapJDB;
  setCurrentContent: Dispatch<SetStateAction<keyof ContentMapJDB>>;
  bookType: BookType;
  setBookType: Dispatch<SetStateAction<BookType>>;
  purchasedOrBorrowed: PurchasedOrBorrowed;
  setPurchasedOrBorrowed: Dispatch<SetStateAction<PurchasedOrBorrowed>>;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  uniqueURL: string | undefined;
  setUniqueURL: Dispatch<SetStateAction<string | undefined>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  success: boolean;
  setSuccess: Dispatch<SetStateAction<boolean>>;
  isVerified: boolean;
  setIsVerified: Dispatch<SetStateAction<boolean>>;
  error: keyof ContentMapJDB | undefined;
  setError: Dispatch<SetStateAction<keyof ContentMapJDB | undefined>>;
  windowWidth: number;
  setWindowWidth: Dispatch<SetStateAction<number>>;
  handleCodeSubmission: (buttonTrigger: string) => void;
  setHandleCodeSubmission: React.Dispatch<React.SetStateAction<(buttonTrigger: string) => void>>;
}

export const BookContext = createContext<BookContextType>({} as BookContextType);

interface Props {
  children: ReactNode;
}

export const BookProvider: React.FC<Props> = ({ children }) => {
  const [bookType, setBookType] = useState<BookType>("");
  const [purchasedOrBorrowed, setPurchasedOrBorrowed] = useState<PurchasedOrBorrowed>("");
  const [email, setEmail] = useState<string>("");
  // const [confirmEmail, setConfirmEmail] = useState<EmailJDB>("");
  const [code, setCode] = useState<string>("");
  const [uniqueURL, setUniqueURL] = useState<string | undefined>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [currentContent, setCurrentContent] = useState<keyof ContentMapJDB>("physicalOrDigital");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [error, setError] = useState<keyof ContentMapJDB | undefined>(undefined);
  const [handleCodeSubmission, setHandleCodeSubmission] = useState<(buttonTrigger: string) => void>(() => {});

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const debouncedHandleResize = debounce(handleResize, 400);
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
