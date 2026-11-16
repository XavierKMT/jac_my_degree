export type CourseRule = {
  courseId: string;
  prerequisites?: string[];
  coRequisites?: string[];
  message: string;
};

export type SemesterDistribution = {
  min: number;
  max: number;
};

export type FlexibleCourseGroup = {
  id: string;
  semesters: number[];
  courseIds: string[];
  label?: string;
  semesterLabels?: Record<number, string>;
  distribution?: Record<number, SemesterDistribution>;
  color?: string;
};

export const courseRules: CourseRule[] = [
  {
    courseId: "203-SN2-RE",
    prerequisites: ["203-SN3-RE"],
    message: "Electricity and Magnetism requires Waves and Modern Physics as a prerequisite."
  },
  {
    courseId: "203-SN3-RE",
    prerequisites: ["203-SN1-RE"],
    message: "Waves and Modern Physics requires Mechanics as a prerequisite."
  }
];

export const flexibleCourseGroups: FlexibleCourseGroup[] = [
  {
    id: "first&second",
    semesters: [1, 2],
    courseIds: ["420-SN1-RE", "201-SN1-RE"],
    label: "Choose one from",
    color: "#e8f4f8"
  },
  {
    id: "second&third",
    semesters: [2, 3],
    courseIds: ["101-SN1-RE", "203-SN3-RE"],
    label: "Choose one from",
    color: "#f0e8f8"
  },
  {
    id: "third&fourth",
    semesters: [3, 4],
    courseIds: ["101-SN2-RE", "203-SN2-RE", "201-SN4-RE"],
    color: "#f8f0e8",
    semesterLabels: {
      3: "Choose 2 from",
      4: "Choose 1 from"
    },
    distribution: {
      3: { min: 2, max: 2 },
      4: { min: 1, max: 1 }
    }
  }
];

export const languageRule = {
  courseIds: ["202-SN2-RE", "201-SN3-RE", "101-SN2-RE", "203-SN2-RE"],
  message: "One of the following courses must be taken in French: 202-SN2-RE, 201-SN3-RE, 101-SN2-RE, 203-SN2-RE."
};
