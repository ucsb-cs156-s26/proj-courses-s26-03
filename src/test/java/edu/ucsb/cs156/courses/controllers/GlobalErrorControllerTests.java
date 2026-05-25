package edu.ucsb.cs156.courses.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.courses.ControllerTestCase;
import edu.ucsb.cs156.courses.repositories.UserRepository;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = GlobalErrorController.class)
public class GlobalErrorControllerTests extends ControllerTestCase {

  @MockBean UserRepository userRepository;
  @MockBean ErrorAttributes errorAttributes;

  @Test
  public void handleError_redirects_to_errors_page() throws Exception {
    Map<String, Object> errorMap =
        Map.of(
            "status", 500,
            "error", "Internal Server Error",
            "message", "Something went wrong",
            "path", "/api/test");

    when(errorAttributes.getErrorAttributes(any(), any())).thenReturn(errorMap);

    MockHttpSession session = new MockHttpSession();

    mockMvc
        .perform(get("/error").session(session))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/errors"));
  }

  @Test
  public void handleError_stores_error_attributes_in_session() throws Exception {
    Map<String, Object> errorMap =
        Map.of(
            "status", 404,
            "error", "Not Found",
            "message", "Resource not found",
            "path", "/api/missing",
            "trace",
                "java.lang.RuntimeException: Resource not found\n\tat SomeClass.method(SomeClass.java:42)");

    when(errorAttributes.getErrorAttributes(any(), any())).thenReturn(errorMap);

    MockHttpSession session = new MockHttpSession();

    MvcResult result =
        mockMvc
            .perform(get("/error").session(session))
            .andExpect(status().is3xxRedirection())
            .andReturn();

    @SuppressWarnings("unchecked")
    Map<String, Object> sessionError =
        (Map<String, Object>) result.getRequest().getSession().getAttribute("currentError");

    assertNotNull(sessionError);
    assertEquals(404, sessionError.get("status"));
    assertEquals("Not Found", sessionError.get("error"));
    assertEquals("Resource not found", sessionError.get("message"));
    assertEquals("/api/missing", sessionError.get("path"));
  }
}
