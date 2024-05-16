// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const transitionSettings = {
//   initial: {
//     type: "spring",
//     damping: 20,
//     stiffness: 100,
//     duration: 0.5,
//     bounce: 0,
//     ease: "backInOut",
//   },
// };

// const transitionSettings2 = {
//   initial: {
//     type: "spring",
//     damping: 20,
//     stiffness: 100,
//     duration: 0.5,
//     bounce: 0,
//     delay: 0.5,
//     ease: "backInOut",
//   },
// };

// export const FadeComponent = ({ children, key }) => (
//   <AnimatePresence mode="wait">
//     <motion.div
//       key={key}
//       initial={{ opacity: 0.1, y: 10 }}
//       transition={{ ...transitionSettings.initial }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -100, transition: { duration: 1 } }}
//     >
//       {children}
//     </motion.div>
//   </AnimatePresence>
// );

// export const FadeComponent2 = ({ children, questionPassed }) => (
//   <AnimatePresence mode="wait">
//     <motion.div
//       key={questionPassed}
//       initial={{ opacity: 0, y: 10 }}
//       transition={{ ...transitionSettings2.initial }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -100, transition: { delay: 1, duration: 1 } }}
//     >
//       {children}
//     </motion.div>
//   </AnimatePresence>
// );
