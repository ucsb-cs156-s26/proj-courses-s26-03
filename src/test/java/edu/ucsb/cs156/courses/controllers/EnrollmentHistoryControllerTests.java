package edu.ucsb.cs156.courses.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.courses.ControllerTestCase;
import edu.ucsb.cs156.courses.entities.EnrollmentDataPoint;
import edu.ucsb.cs156.courses.repositories.EnrollmentDataPointRepository;
import edu.ucsb.cs156.courses.repositories.UserRepository;
import edu.ucsb.cs156.courses.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = {EnrollmentHistoryController.class})
@Import(TestConfig.class)
public class EnrollmentHistoryControllerTests extends ControllerTestCase {

  @MockBean EnrollmentDataPointRepository enrollmentDataPointRepository;

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean UserRepository userRepository;

  @Test
  public void test_getEnrollmentHistory() throws Exception {
    List<EnrollmentDataPoint> points = new ArrayList<>();
    points.add(
        EnrollmentDataPoint.builder()
            .courseId("CMPSC   156")
            .yyyyq("20244")
            .enrollCd("12345")
            .section("0100")
            .enrollment(180)
            .build());
    points.add(
        EnrollmentDataPoint.builder()
            .courseId("CMPSC   156")
            .yyyyq("20252")
            .enrollCd("67890")
            .section("0100")
            .enrollment(196)
            .build());

    when(enrollmentDataPointRepository.findByCourseId(eq("CMPSC   156"))).thenReturn(points);

    MvcResult response =
        mockMvc
            .perform(get("/api/enrollmenthistory/search?subjectArea=CMPSC&courseNumber=156"))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson = objectMapper.writeValueAsString(points);
    String actualJson = response.getResponse().getContentAsString();
    assertEquals(expectedJson, actualJson);
  }

  @Test
  public void test_getEnrollmentHistory_emptyResult() throws Exception {
    when(enrollmentDataPointRepository.findByCourseId(eq("CMPSC   156")))
        .thenReturn(new ArrayList<>());

    MvcResult response =
        mockMvc
            .perform(get("/api/enrollmenthistory/search?subjectArea=CMPSC&courseNumber=156"))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals("[]", response.getResponse().getContentAsString());
  }

  @Test
  public void test_getEnrollmentHistory_withSuffix() throws Exception {
    List<EnrollmentDataPoint> points = new ArrayList<>();
    points.add(
        EnrollmentDataPoint.builder()
            .courseId("CMPSC   130A")
            .yyyyq("20204")
            .enrollCd("11111")
            .section("0100")
            .enrollment(45)
            .build());

    when(enrollmentDataPointRepository.findByCourseId(eq("CMPSC   130A"))).thenReturn(points);

    MvcResult response =
        mockMvc
            .perform(get("/api/enrollmenthistory/search?subjectArea=CMPSC&courseNumber=130A"))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson = objectMapper.writeValueAsString(points);
    assertEquals(expectedJson, response.getResponse().getContentAsString());
  }
}
