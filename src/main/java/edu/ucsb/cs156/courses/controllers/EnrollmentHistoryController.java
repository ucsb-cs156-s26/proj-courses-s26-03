package edu.ucsb.cs156.courses.controllers;

import edu.ucsb.cs156.courses.entities.EnrollmentDataPoint;
import edu.ucsb.cs156.courses.repositories.EnrollmentDataPointRepository;
import edu.ucsb.cs156.courses.utilities.CourseUtilities;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Tag(name = "API for enrollment history data")
@RequestMapping("/api/enrollmenthistory")
@RestController
public class EnrollmentHistoryController extends ApiController {

  @Autowired EnrollmentDataPointRepository enrollmentDataPointRepository;

  @Operation(summary = "Get enrollment history for a course across all quarters")
  @GetMapping(value = "/search", produces = "application/json")
  public Iterable<EnrollmentDataPoint> enrollmentHistoryBySubjectAreaAndCourseNumber(
      @Parameter(
              name = "subjectArea",
              description = "Subject area of UCSB course",
              example = "CMPSC",
              required = true)
          @RequestParam
          String subjectArea,
      @Parameter(
              name = "courseNumber",
              description = "Course number within a subject area",
              example = "156",
              required = true)
          @RequestParam
          String courseNumber) {
    String courseId = CourseUtilities.makeFormattedCourseId(subjectArea, courseNumber);
    return enrollmentDataPointRepository.findByCourseIdStartingWith(courseId);
  }
}
