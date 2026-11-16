import { useState, type Dispatch, type SetStateAction } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { FaExclamationTriangle } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";

import { courses, Course, CourseSection } from "./data/courses.ts";
import { courseRules, flexibleCourseGroups, languageRule } from "./data/rules.ts";
// @ts-ignore - side-effect CSS import handled by bundler
import "./styles/planner.css";

/* -------------------- Types -------------------- */

type Semester = {
  id: number;
  label: string;
  protected: boolean;
};

type CourseAssignments = Record<string, string[]>;
type EditableCodeValues = Record<string, Record<number, string>>;
type DropTarget = string | number;

/* -------------------- Helpers -------------------- */

function createSemester(index: number, protectedSem = false): Semester {
  return {
    id: index,
    label: `Semester ${index}`,
    protected: protectedSem
  };
}

function getCourseSectionColor(section?: CourseSection) {
  switch (section) {
    case CourseSection.English:
      return "#dfe9ff";
    case CourseSection.French:
      return "#ffe4d6";
    case CourseSection.Humanities:
      return "#e7e2ff";
    case CourseSection.Physics:
      return "#dff7f0";
    case CourseSection.Biology:
      return "#e8f7d6";
    case CourseSection.Chemistry:
      return "#fff2cc";
    case CourseSection.Math:
      return "#f8dfe8";
    case CourseSection.PhysEd:
      return "#dfeefc";
    case CourseSection.Complementary:
      return "#f4e6d7";
    case CourseSection.Project:
      return "#e8dff8";
    default:
      return "#ffffff";
  }
}

function renderCourseCodeText(
  course: Course,
  editableCodeValues: EditableCodeValues
) {
  if (!course.editable) {
    return course.code;
  }

  const values = editableCodeValues[course.id] ?? {};
  const parts = course.code.match(/_+|[^_]+/g) ?? [];

  return parts.map((part, index) => {
    if (!part.includes("_")) {
      return <span key={`${course.id}-${index}`}>{part}</span>;
    }

    const typedValue = values[index] ?? "";

    return (
      <span
        key={`${course.id}-${index}`}
        className={typedValue ? "course-code-entered" : "course-code-placeholder"}
      >
        {typedValue || part}
      </span>
    );
  });
}

const coursesById = new Map(courses.map(course => [course.id, course]));
const flexibleGroupById = new Map(
  flexibleCourseGroups.map(group => [group.id, group])
);

/* -------------------- App -------------------- */

export default function App() {
  const [semesters, setSemesters] = useState<Semester[]>([
    createSemester(1, true),
    createSemester(2, true),
    createSemester(3, true),
    createSemester(4, true)
  ]);

  const [assignments, setAssignments] = useState<CourseAssignments>({
    unassigned: courses.map(c => c.id)
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseLanguages, setCourseLanguages] = useState<Record<string, "en" | "fr">>({});
  const [editableCodeValues, setEditableCodeValues] = useState<EditableCodeValues>({});
  const [showViolations, setShowViolations] = useState(false);
  const [hideDefaultSchedule, setHideDefaultSchedule] = useState(false); 

  function moveCourse(courseId: string, target: DropTarget) {
    setAssignments(prev => {
      const next: CourseAssignments = {};
      const targetKey = String(target);

      for (const key in prev) {
        next[key] = prev[key].filter(id => id !== courseId);
      }

      if (!next[targetKey]) next[targetKey] = [];
      next[targetKey].push(courseId);

      if (!hideDefaultSchedule) {
        const targetSemester = Number(target);
        const movedCourse = coursesById.get(courseId);
        const group =
          movedCourse?.choiceGroup
            ? flexibleGroupById.get(movedCourse.choiceGroup)
            : undefined;

        if (
          group &&
          targetKey !== "unassigned" &&
          Number.isFinite(targetSemester) &&
          group.semesters.includes(targetSemester) &&
          group.courseIds.length === 2
        ) {
          const pairedCourseId = group.courseIds.find(id => id !== courseId);

          if (pairedCourseId && (next.unassigned ?? []).includes(pairedCourseId)) {
            const pairedSemester = group.semesters.find(
              semesterId => semesterId !== targetSemester
            );

            if (pairedSemester !== undefined) {
              for (const key in next) {
                next[key] = next[key].filter(id => id !== pairedCourseId);
              }

              if (!next[pairedSemester]) {
                next[pairedSemester] = [];
              }
              next[pairedSemester].push(pairedCourseId);
            }
          }
        }
      }

      return next;
    });
  }

  function addSemester() {
    setSemesters(prev => [
      ...prev,
      createSemester(prev.length + 1, false)
    ]);
  }

  function fillDefaultSemesters() {
    const nextAssignments: CourseAssignments = { unassigned: [] };
    let maxDefaultSemester = 1;
    const maxFlexibleSemester = flexibleCourseGroups.reduce((max, group) => {
      if (!group.semesters.length) {
        return max;
      }
      return Math.max(max, Math.max(...group.semesters));
    }, 1);

    courses.forEach(course => {
      if (course.choiceGroup) {
        nextAssignments.unassigned.push(course.id);
        return;
      }

      const sem = course.defaultSemester;

      if (typeof sem === "number" && sem > 0) {
        if (!nextAssignments[sem]) {
          nextAssignments[sem] = [];
        }
        nextAssignments[sem].push(course.id);
        maxDefaultSemester = Math.max(maxDefaultSemester, sem);
      } else {
        nextAssignments.unassigned.push(course.id);
      }
    });

    setSemesters(prev => {
      const targetCount = Math.max(
        prev.length,
        maxDefaultSemester,
        maxFlexibleSemester
      );

      return Array.from({ length: targetCount }, (_, index) => {
        const semesterNumber = index + 1;
        const existing = prev[index];

        if (existing) {
          return {
            ...existing,
            id: semesterNumber,
            label: `Semester ${semesterNumber}`
          };
        }

        return createSemester(semesterNumber, semesterNumber <= 4);
      });
    });

    setAssignments(nextAssignments);
  }

  function clearAllCourses() {
    setAssignments({
      unassigned: courses.map(course => course.id)
    });
  }

  function removeSemester(removedId: number) {
    setSemesters(prev => {
      return prev
        .filter(s => s.id !== removedId)
        .map(s =>
          s.id > removedId
            ? { ...s, id: s.id - 1, label: `Semester ${s.id - 1}` }
            : s
        );
    });
  
    setAssignments(prev => {
      const next: CourseAssignments = {
        unassigned: [...prev.unassigned]
      };
  
      // 1ï¸âƒ£ Return courses from the deleted semester
      if (prev[removedId]) {
        next.unassigned.push(...prev[removedId]);
      }
  
      // 2ï¸âƒ£ Re-map remaining semesters
      Object.entries(prev).forEach(([key, courseIds]) => {
        if (key === "unassigned") return;
  
        const id = Number(key);
  
        if (id < removedId) {
          next[id] = courseIds;
        } else if (id > removedId) {
          next[id - 1] = courseIds;
        }
      });
  
      return next;
    });
  }

  const selectedCourse =
    selectedCourseId !== null
      ? courses.find(course => course.id === selectedCourseId) ?? null
      : null;

  const selectedCourseLanguage =
    selectedCourse && selectedCourse.french
      ? courseLanguages[selectedCourse.id] ?? "en"
      : "en";

  const selectedCourseView =
    selectedCourse && selectedCourse.french && selectedCourseLanguage === "fr"
      ? selectedCourse.french
      : selectedCourse;

  const semesterByCourse: Record<string, number> = {};
  Object.entries(assignments).forEach(([key, courseIds]) => {
    if (key === "unassigned") {
      return;
    }

    const semesterNumber = Number(key);
    if (!Number.isFinite(semesterNumber)) {
      return;
    }

    courseIds.forEach(courseId => {
      semesterByCourse[courseId] = semesterNumber;
    });
  });

  const ruleViolations = courseRules.flatMap(rule => {
    const targetSemester = semesterByCourse[rule.courseId];
    if (!targetSemester || !rule.prerequisites?.length) {
      return [];
    }

    const violated = rule.prerequisites.some(prereqId => {
      const prereqSemester = semesterByCourse[prereqId];
      return !prereqSemester || prereqSemester >= targetSemester;
    });

    return violated ? [rule.message] : [];
  });

  const violatesLanguageRule =
    languageRule.courseIds.every(id => semesterByCourse[id] !== undefined) &&
    !languageRule.courseIds.some(id => courseLanguages[id] === "fr");

  if (violatesLanguageRule) {
    ruleViolations.push(languageRule.message);
  }

  if (!hideDefaultSchedule) {
    flexibleCourseGroups.forEach(group => {
      if (group.courseIds.length < 2 || group.semesters.length < 2) {
        return;
      }

      const placedSemesters = group.courseIds
        .map(courseId => semesterByCourse[courseId])
        .filter((semester): semester is number => semester !== undefined);

      const hasOutOfSpanPlacement = placedSemesters.some(
        semester => !group.semesters.includes(semester)
      );
      const hasDuplicateSemester =
        new Set(placedSemesters).size !== placedSemesters.length;

      if (hasOutOfSpanPlacement || hasDuplicateSemester) {
        const semesterList = group.semesters
          .map(semester => `Semester ${semester}`)
          .join(" & ");
        ruleViolations.push(
          `Flexible group (${group.id}) must be split across ${semesterList}.`
        );
      }
    });
  }

  function renderEditableCode(course: Course) {
    if (!course.editable) {
      return course.code;
    }

    const tokens = course.code.match(/_+|[^_]+/g) ?? [];
    const values = editableCodeValues[course.id] ?? {};

    return tokens.map((token, index) => {
      if (!token.includes("_")) {
        return <span key={`${course.id}-${index}`}>{token}</span>;
      }

      return (
        <input
          key={`${course.id}-${index}`}
          type="text"
          value={values[index] ?? ""}
          placeholder={token}
          className="editable-code-input"
          maxLength={Math.max(token.length, 1)}
          style={{ width: `${Math.max(token.length, 1)}ch` }}
          onChange={event => {
            const nextValue = event.target.value;
            setEditableCodeValues(prev => ({
              ...prev,
              [course.id]: {
                ...(prev[course.id] ?? {}),
                [index]: nextValue
              }
            }));
          }}
        />
      );
    });
  }

  return (
    <DndContext
      onDragEnd={({ active, over }) => {
        if (!over) return;
        moveCourse(String(active.id), over.id as DropTarget);
      }}
    >
      <div className="planner">
        <div className="semester-row">
          {semesters.map(semester => (
            <SemesterBlock
              key={semester.id}
              semester={semester}
              courseIds={assignments[semester.id] ?? []}
              onRemove={removeSemester}
              onSelectCourse={setSelectedCourseId}
              editableCodeValues={editableCodeValues}
              courseLanguages={courseLanguages}
              setCourseLanguages={setCourseLanguages}
              hideDefaultSchedule={hideDefaultSchedule}
            />
          ))}

          <button className="add-semester" onClick={addSemester}>
            + Add Semester
          </button>
        </div>

        <div className="toolbar-strip">
          <div className="toolbar-left">
            <button
              type="button"
              className="fill-default-button"
              onClick={fillDefaultSemesters}
            >
              Fill Default
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={hideDefaultSchedule}
                onChange={(e) => setHideDefaultSchedule(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              Hide Default
            </label>
            <button
              type="button"
              className="clear-courses-button"
              onClick={clearAllCourses}
            >
              Clear
            </button>
          </div>
          <div className="toolbar-center">
            {ruleViolations.length > 0 && (
              <div className="rules-warning-container">
                <button
                  type="button"
                  className="rules-warning-icon"
                  onClick={() => setShowViolations(prev => !prev)}
                  >
                  <FaExclamationTriangle aria-hidden="true" />
                </button>
                {showViolations && (
                  <div className="rules-warning-popup" role="dialog">
                    {ruleViolations.map((violation, i) => (
                      <div key={i}>{violation}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="toolbar-message">
            right click to edit course numbers or switch between English/French versions of courses
          </div>
        </div>

        <CoursePool
          courseIds={assignments.unassigned}
          onSelectCourse={setSelectedCourseId}
          editableCodeValues={editableCodeValues}
          courseLanguages={courseLanguages}
          setCourseLanguages={setCourseLanguages}
        />
      </div>

      {selectedCourse && selectedCourseView && (
        <div
          className="course-modal-backdrop"
          onClick={() => setSelectedCourseId(null)}
        >
          <div
            className="course-modal"
            role="dialog"
            aria-modal="true"
            onClick={event => event.stopPropagation()}
          >
            <div className="course-modal-header">
              <h2>Course details</h2>
              <button
                type="button"
                className="close-modal"
                onClick={() => setSelectedCourseId(null)}
              >
                x
              </button>
            </div>

            {selectedCourse.french && (
              <div className="course-language-toggle">
                <button
                  type="button"
                  className={selectedCourseLanguage === "en" ? "active" : ""}
                  onClick={() =>
                    setCourseLanguages(prev => ({
                      ...prev,
                      [selectedCourse.id]: "en"
                    }))
                  }
                >
                  English
                </button>
                <button
                  type="button"
                  className={selectedCourseLanguage === "fr" ? "active" : ""}
                  onClick={() =>
                    setCourseLanguages(prev => ({
                      ...prev,
                      [selectedCourse.id]: "fr"
                    }))
                  }
                >
                  Français
                </button>
              </div>
            )}

            <div className="course-modal-body">
              <p>
                <strong>Code:</strong> {renderEditableCode(selectedCourseView)}
              </p>
              <p>
                <strong>Name:</strong> {selectedCourseView.name}
              </p>
              <p>
                <strong>Credits:</strong> {selectedCourseView.credits}
              </p>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}

/* -------------------- Components -------------------- */

function SemesterBlock({
  semester,
  courseIds,
  onRemove,
  onSelectCourse,
  editableCodeValues,
  courseLanguages,
  setCourseLanguages,
  hideDefaultSchedule
}: {
  semester: Semester;
  courseIds: string[];
  onRemove: (id: number) => void;
  onSelectCourse: (courseId: string) => void;
  editableCodeValues: EditableCodeValues;
  courseLanguages: Record<string, "en" | "fr">;
  setCourseLanguages: Dispatch<SetStateAction<Record<string, "en" | "fr">>>;
  hideDefaultSchedule: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: semester.id });
  const semesterFlexibleGroups = hideDefaultSchedule ? [] : flexibleCourseGroups.filter(group =>
    group.semesters.includes(semester.id)
  );
  const flexibleCourseIdsInSemester = new Set(
    semesterFlexibleGroups.flatMap(group =>
      group.courseIds.filter(courseId => courseIds.includes(courseId))
    )
  );
  const regularCourseIds = courseIds.filter(
    courseId => !flexibleCourseIdsInSemester.has(courseId)
  );

  return (
    <div
      ref={setNodeRef}
      className={`semester ${isOver ? "hover" : ""}`}
    >
      <div className="semester-header">
        <h3>{semester.label}</h3>
        {!semester.protected && (
          <button onClick={() => onRemove(semester.id)}>âœ•</button>
        )}
      </div>

      {!hideDefaultSchedule && semesterFlexibleGroups.length > 0 && (
        <div className="semester-flexible-groups">
          {semesterFlexibleGroups.map((group, groupIndex) => {
            const groupCourseIds = group.courseIds.filter(courseId =>
              courseIds.includes(courseId)
            );

            return (
              <div key={`${semester.id}-${group.id}`} className="semester-flexible-group" style={{ backgroundColor: group.color || "transparent" }}>
                <div className="semester-flexible-group-label">
                  {group.semesterLabels?.[semester.id] || group.label || `Flexible group ${groupIndex + 1}`}:{' '}
                  {group.courseIds.map(courseId => {
                    const course = coursesById.get(courseId);
                    return course?.code;
                  }).join(', ')}
                </div>

                <div className="semester-flexible-group-course-list">
                  {groupCourseIds.map(courseId => (
                    <CourseTile
                      key={`${group.id}-${courseId}`}
                      courseId={courseId}
                      onSelectCourse={onSelectCourse}
                      editableCodeValues={editableCodeValues}
                      courseLanguages={courseLanguages}
                      setCourseLanguages={setCourseLanguages}
                      highlight="placed"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {regularCourseIds.map(courseId => (
        <CourseTile
          key={courseId}
          courseId={courseId}
          onSelectCourse={onSelectCourse}
          editableCodeValues={editableCodeValues}
          courseLanguages={courseLanguages}
          setCourseLanguages={setCourseLanguages}
        />
      ))}
    </div>
  );
}

function CoursePool({
  courseIds,
  onSelectCourse,
  editableCodeValues,
  courseLanguages,
  setCourseLanguages
}: {
  courseIds: string[];
  onSelectCourse: (courseId: string) => void;
  editableCodeValues: EditableCodeValues;
  courseLanguages: Record<string, "en" | "fr">;
  setCourseLanguages: Dispatch<SetStateAction<Record<string, "en" | "fr">>>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned" });

  return (
    <div
      ref={setNodeRef}
      className={`course-pool ${isOver ? "hover" : ""}`}
    >
      <h3 className="course-pool-title">Course Pool</h3>
      {courseIds.map(courseId => (
        <CourseTile
          key={courseId}
          courseId={courseId}
          onSelectCourse={onSelectCourse}
          editableCodeValues={editableCodeValues}
          courseLanguages={courseLanguages}
          setCourseLanguages={setCourseLanguages}
        />
      ))}
    </div>
  );
}


function CourseTile({
  courseId,
  onSelectCourse,
  editableCodeValues,
  courseLanguages,
  setCourseLanguages,
  forcePlainCode = false,
  highlight
}: {
  courseId: string;
  onSelectCourse: (courseId: string) => void;
  editableCodeValues: EditableCodeValues;
  courseLanguages: Record<string, "en" | "fr">;
  setCourseLanguages: Dispatch<SetStateAction<Record<string, "en" | "fr">>>;
  forcePlainCode?: boolean;
  highlight?: "placed" | "pending";
}) {
  const course = courses.find(c => c.id === courseId) as Course;
  const displayCourse =
    course.french && courseLanguages[course.id] === "fr"
      ? course.french
      : course;

  const { setNodeRef, listeners, attributes, transform } =
    useDraggable({ id: courseId });

  const tileClassName = [
    "course-tile",
    highlight ? `course-tile-${highlight}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={tileClassName}
      onContextMenu={event => {
        event.preventDefault();
        onSelectCourse(courseId);
      }}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        backgroundColor: getCourseSectionColor(course.section)
      }}
    >
      <div className="course-tile-top-row">
        <strong>
          {forcePlainCode ? (
            <span className="course-code-plain-text">{displayCourse.code}</span>
          ) : (
            renderCourseCodeText(displayCourse, editableCodeValues)
          )}
        </strong>
        {course.french && !forcePlainCode && (
          <span
            className="course-language-icon"
            title="French version available"
            aria-label="French version available"
          >
            <CiGlobe aria-hidden="true" />
          </span>
        )}
      </div>
      {!forcePlainCode && <div>{displayCourse.name}</div>}
    </button>
  );
}
