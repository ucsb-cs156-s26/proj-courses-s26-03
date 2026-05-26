package edu.ucsb.cs156.courses.documents;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.mapping.Document;

@Slf4j
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(
    ignoreUnknown = true,
    value = {"contactHours"})
@Document(collection = "courses")
public class Course {
  private String quarter;
  private String courseId;
  private String title;
  private String description;
  private Integer unitsFixed;
  private List<Section> classSections;
  private List<GeneralEducation> generalEducation;
}
