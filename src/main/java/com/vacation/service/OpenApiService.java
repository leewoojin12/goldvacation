package com.vacation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vacation.HolidayDto;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.http.*;


@Service
public class OpenApiService {


    String url = "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService";

    String API_KEY = "97671c30825687d064665623b2d8f2c7dcc0e3f2c4e6db87c14de698f6796079";

    public List<HolidayDto> getOpenApiScheduler(String year) throws JsonProcessingException {

        String baseUrl = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";

        URI uri = UriComponentsBuilder
                .fromUriString(baseUrl)
                .queryParam("serviceKey", API_KEY)   // API_KEY는 보통 이미 인코딩된 키라 encode() 주의
                .queryParam("solYear", year)
                .queryParam("numOfRows", "100")
                .build(true) // true: serviceKey에 들어있는 % 등 인코딩 문자 유지
                .toUri();

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                uri,
                HttpMethod.GET,
                entity,
                String.class
        );


        String responseBody = response.getBody();

        if (responseBody == null) {
            throw new IllegalStateException("공휴일 API 응답이 비어있음");
        }
        ObjectMapper objectMapper = new ObjectMapper();

        JsonNode root = objectMapper.readTree(responseBody);

        JsonNode itemsNode = root
                .path("response")
                .path("body")
                .path("items")
                .path("item");

        List<HolidayDto> holidays =
                StreamSupport.stream(itemsNode.spliterator(), false)
                        .map(node -> {
                            String name = node.path("dateName").asText();
                            String rawDate = node.path("locdate").asText(); // 20251225

                            String date =
                                    rawDate.substring(0, 4) + "-" +
                                            rawDate.substring(4, 6) + "-" +
                                            rawDate.substring(6, 8);

                            return new HolidayDto(name, date);
                        })
                        .collect(Collectors.toList());

        return holidays;
    }


}
