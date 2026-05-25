package edu.ucsb.cs156.courses.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.courses.ControllerTestCase;
import edu.ucsb.cs156.courses.repositories.UserRepository;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = ErrorInfoController.class)
public class ErrorInfoControllerTests extends ControllerTestCase {

  @MockBean UserRepository userRepository;

  @Test
  public void getCurrentError_returns_204_when_no_error_in_session() throws Exception {
    mockMvc.perform(get("/api/currentError")).andExpect(status().isNoContent());
  }

  @Test
  public void getCurrentError_returns_200_with_error_info_from_session() throws Exception {
    Map<String, Object> errorInfo =
        Map.of(
            "status", 500,
            "error", "Internal Server Error",
            "message", "Something went wrong",
            "path", "/api/test");

    MockHttpSession session = new MockHttpSession();
    session.setAttribute("currentError", errorInfo);

    MvcResult result =
        mockMvc
            .perform(get("/api/currentError").session(session))
            .andExpect(status().isOk())
            .andReturn();

    Map<String, Object> responseJson = responseToJson(result);
    assertEquals(500, responseJson.get("status"));
    assertEquals("Internal Server Error", responseJson.get("error"));
    assertEquals("Something went wrong", responseJson.get("message"));
    assertEquals("/api/test", responseJson.get("path"));
  }

  @Test
  public void getCurrentError_returns_error_with_trace() throws Exception {
    Map<String, Object> errorInfo =
        Map.of(
            "status", 500,
            "error", "Internal Server Error",
            "message", "Something went wrong",
            "path", "/api/test",
            "trace",
                "java.lang.RuntimeException: Something went wrong\n\tat SomeClass.method(SomeClass.java:42)");

    MockHttpSession session = new MockHttpSession();
    session.setAttribute("currentError", errorInfo);

    MvcResult result =
        mockMvc
            .perform(get("/api/currentError").session(session))
            .andExpect(status().isOk())
            .andReturn();

    Map<String, Object> responseJson = responseToJson(result);
    assertEquals(
        "java.lang.RuntimeException: Something went wrong\n\tat SomeClass.method(SomeClass.java:42)",
        responseJson.get("trace"));
  }
}
