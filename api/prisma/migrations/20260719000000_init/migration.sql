-- Prisma migration `init` for Gym (MySQL 8.4)
-- Generated manually pending local Docker MySQL setup.
-- Once Docker is available: `pnpm db:up && pnpm db:migrate && pnpm db:seed`.
-- Run via: `pnpm --filter api exec prisma migrate deploy` (uses this dir).

CREATE TABLE `profiles`
(
    `id`            VARCHAR(191)                       NOT NULL,
    `email`         VARCHAR(191)                       NOT NULL,
    `passwordHash`  LONGTEXT                           NOT NULL,
    `name`          VARCHAR(191)                       NOT NULL,
    `whatsapp`      VARCHAR(191)                       NULL,
    `birth_date`    DATETIME(3)                        NULL,
    `role`          ENUM('ADMIN','TRAINER','MEMBER')  NOT NULL DEFAULT 'MEMBER',
    `isActive`      BOOLEAN                            NOT NULL DEFAULT true,
    `createdAt`     DATETIME(3)                        NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`     DATETIME(3)                        NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `profiles_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `members`
(
    `id`                 VARCHAR(191)   NOT NULL,
    `profileId`          VARCHAR(191)   NOT NULL,
    `memberCode`         VARCHAR(8)     NOT NULL,
    `expiry_date`        DATETIME(3)    NULL,
    `status`            VARCHAR(191)   NOT NULL DEFAULT 'expired',
    `last_payment_date` DATETIME(3)     NULL,
    `createdAt`          DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`          DATETIME(3)    NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `members_profileId_key` (`profileId`),
    UNIQUE INDEX `members_memberCode_key` (`memberCode`),
    INDEX `members_status_idx` (`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `trainers`
(
    `id`         VARCHAR(191) NOT NULL,
    `profileId`  VARCHAR(191) NOT NULL,
    `specialty`  VARCHAR(191) NULL,
    `bio`        LONGTEXT     NULL,
    `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`  DATETIME(3)  NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `trainers_profileId_key` (`profileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `payments`
(
    `id`          VARCHAR(191)              NOT NULL,
    `memberId`    VARCHAR(191)              NOT NULL,
    `plan`        VARCHAR(191)              NOT NULL,
    `amount`      DECIMAL(10, 2)            NOT NULL,
    `payment_date` DATETIME(3)              NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt`   DATETIME(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `payments_memberId_idx` (`memberId`),
    INDEX `payments_payment_date_idx` (`payment_date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `attendance`
(
    `id`           VARCHAR(191) NOT NULL,
    `memberId`     VARCHAR(191) NOT NULL,
    `check_in_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `attendance_memberId_idx` (`memberId`),
    INDEX `attendance_check_in_time_idx` (`check_in_time`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `failed_access_attempts`
(
    `id`           VARCHAR(191) NOT NULL,
    `memberId`     VARCHAR(191) NULL,
    `reason`       VARCHAR(191) NOT NULL,
    `attempt_time` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `failed_access_attempts_attempt_time_idx` (`attempt_time`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `schedule_classes`
(
    `id`           VARCHAR(191) NOT NULL,
    `class_name`   VARCHAR(191) NOT NULL,
    `day_of_week`  VARCHAR(191) NOT NULL,
    `start_time`   VARCHAR(191) NOT NULL,
    `instructor`   VARCHAR(191) NOT NULL,
    `max_capacity` INT          NOT NULL DEFAULT 20,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)  NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `class_bookings`
(
    `id`        VARCHAR(191) NOT NULL,
    `classId`   VARCHAR(191) NOT NULL,
    `memberId`  VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `class_bookings_classId_memberId_key` (`classId`, `memberId`),
    INDEX `class_bookings_classId_idx` (`classId`),
    INDEX `class_bookings_memberId_idx` (`memberId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notices`
(
    `id`        VARCHAR(191) NOT NULL,
    `title`     VARCHAR(191) NOT NULL,
    `message`   LONGTEXT     NOT NULL,
    `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3)  NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `routines`
(
    `id`          VARCHAR(191)                         NOT NULL,
    `trainerId`   VARCHAR(191)                         NOT NULL,
    `name`        VARCHAR(191)                         NOT NULL,
    `description` LONGTEXT                             NULL,
    `status`      ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt`   DATETIME(3)                          NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)                          NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `routines_trainerId_idx` (`trainerId`),
    INDEX `routines_status_idx` (`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `routine_versions`
(
    `id`         VARCHAR(191)   NOT NULL,
    `routineId`  VARCHAR(191)   NOT NULL,
    `version`    INT            NOT NULL,
    `exercises`  JSON           NOT NULL,
    `changeNote` LONGTEXT       NULL,
    `createdAt`  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `routine_versions_routineId_version_key` (`routineId`, `version`),
    INDEX `routine_versions_routineId_idx` (`routineId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `routine_exercises`
(
    `id`                VARCHAR(191)  NOT NULL,
    `routineId`         VARCHAR(191)  NOT NULL,
    `exerciseId`        VARCHAR(191)  NOT NULL,
    `exerciseName`      VARCHAR(200)  NULL,
    `sets`              INT           NOT NULL,
    `reps`              VARCHAR(64)   NOT NULL,
    `restSeconds`       INT           NULL,
    `notes`             LONGTEXT      NULL,
    `order`             INT           NOT NULL DEFAULT 0,
    `createdAt`         DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `routine_exercises_routineId_idx` (`routineId`),
    INDEX `routine_exercises_exerciseId_idx` (`exerciseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `routine_assignments`
(
    `id`         VARCHAR(191) NOT NULL,
    `memberId`   VARCHAR(191) NOT NULL,
    `trainerId`  VARCHAR(191) NOT NULL,
    `routineId`  VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `due_date`   DATETIME(3)  NULL,
    `notes`      LONGTEXT     NULL,
    `isActive`   BOOLEAN      NOT NULL DEFAULT true,
    `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`  DATETIME(3)  NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `routine_assignments_memberId_idx` (`memberId`),
    INDEX `routine_assignments_trainerId_idx` (`trainerId`),
    INDEX `routine_assignments_routineId_idx` (`routineId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `workout_logs`
(
    `id`                  VARCHAR(191) NOT NULL,
    `memberId`            VARCHAR(191) NOT NULL,
    `assignmentId`       VARCHAR(191) NOT NULL,
    `routineId`          VARCHAR(191) NOT NULL,
    `exerciseId`         VARCHAR(191) NOT NULL,
    `routineExerciseId`  VARCHAR(191) NULL,
    `completedReps`      INT          NULL,
    `weight`             FLOAT        NULL,
    `durationSeconds`    INT          NULL,
    `notes`              LONGTEXT     NULL,
    `date`               DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt`          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `workout_logs_memberId_date_idx` (`memberId`, `date`),
    INDEX `workout_logs_assignmentId_idx` (`assignmentId`),
    INDEX `workout_logs_exerciseId_idx` (`exerciseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Foreign keys
ALTER TABLE `members`        ADD CONSTRAINT `members_profileId_fkey`           FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `trainers`       ADD CONSTRAINT `trainers_profileId_fkey`         FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `payments`       ADD CONSTRAINT `payments_memberId_fkey`          FOREIGN KEY (`memberId`) REFERENCES `members`(`id`)   ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `attendance`     ADD CONSTRAINT `attendance_memberId_fkey`       FOREIGN KEY (`memberId`) REFERENCES `members`(`id`)   ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `failed_access_attempts` ADD CONSTRAINT `failed_access_attempts_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE `class_bookings` ADD CONSTRAINT `class_bookings_classId_fkey`     FOREIGN KEY (`classId`)  REFERENCES `schedule_classes`(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `class_bookings` ADD CONSTRAINT `class_bookings_memberId_fkey`    FOREIGN KEY (`memberId`) REFERENCES `members`(`id`)   ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `routines`       ADD CONSTRAINT `routines_trainerId_fkey`         FOREIGN KEY (`trainerId`) REFERENCES `trainers`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `routine_versions` ADD CONSTRAINT `routine_versions_routineId_fkey` FOREIGN KEY (`routineId`) REFERENCES `routines`(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `routine_exercises` ADD CONSTRAINT `routine_exercises_routineId_fkey` FOREIGN KEY (`routineId`) REFERENCES `routines`(`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `routine_assignments` ADD CONSTRAINT `routine_assignments_memberId_fkey`  FOREIGN KEY (`memberId`)  REFERENCES `members`(`id`)  ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `routine_assignments` ADD CONSTRAINT `routine_assignments_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `trainers`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `routine_assignments` ADD CONSTRAINT `routine_assignments_routineId_fkey`  FOREIGN KEY (`routineId`) REFERENCES `routines`(`id`)  ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `workout_logs` ADD CONSTRAINT `workout_logs_memberId_fkey`      FOREIGN KEY (`memberId`)   REFERENCES `members`(`id`)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `workout_logs` ADD CONSTRAINT `workout_logs_assignmentId_fkey`   FOREIGN KEY (`assignmentId`) REFERENCES `routine_assignments`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT;
