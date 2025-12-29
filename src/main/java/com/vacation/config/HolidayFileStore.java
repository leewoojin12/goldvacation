package com.vacation.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vacation.HolidayDto;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class HolidayFileStore {

    private final Path path = Paths.get("data/holidays.json");
    private final ObjectMapper om = new ObjectMapper();

    public Map<Integer, List<HolidayDto>> load() {
        try {
            if (!Files.exists(path)) return new HashMap<>();
            return om.readValue(
                    Files.readString(path),
                    new TypeReference<>() {}
            );
        } catch (Exception e) {
            throw new RuntimeException("holidays.json read fail", e);
        }
    }

    public void saveAtomically(Map<Integer, List<HolidayDto>> data) {
        try {
            Files.createDirectories(path.getParent());

            Path tmp = Paths.get(path.toString() + ".tmp");
            om.writerWithDefaultPrettyPrinter()
                    .writeValue(tmp.toFile(), data);

            Files.move(
                    tmp,
                    path,
                    StandardCopyOption.REPLACE_EXISTING,
                    StandardCopyOption.ATOMIC_MOVE
            );
        } catch (Exception e) {
            throw new RuntimeException("holidays.json save fail", e);
        }
    }
}
