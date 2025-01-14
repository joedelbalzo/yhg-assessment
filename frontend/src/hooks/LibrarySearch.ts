export const libraryStates = [
  "Alabama",
  "Alaska",
  "American Samoa",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Guam",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Marshall Islands",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Northern Mariana Islands",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Palau",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virgin Islands",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "Digital",
  "International"
];

interface LibraryModule {
  [key: string]: Array<{ state: string; libraryname: string }>;
}

export const loadLibrary = async (state: string) => {
  const idx: number = libraryStates.indexOf(state);
  const stateLibrary: string = state.replace(/\s+/g, "");
  let module: LibraryModule;
  if (state == "Digital") {
    return [{ state: "Digital", libraryname: "Digital" }]
  }
  if (state == "International") {
    return [{ state: "International", libraryname: "International" }]
  }
  if (idx <= 12) {
    module = await import("./libraryData/librariesAtoH");
  } else if (idx <= 29) {
    module = await import("./libraryData/librariesItoM");
  } else if (idx <= 43) {
    module = await import("./libraryData/librariesNtoP");
  } else {
    module = await import("./libraryData/librariesQtoZ");
  }
  return module[stateLibrary];
};
