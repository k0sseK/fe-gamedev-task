<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
    visible: Boolean,
    title: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: false,
    },
});

const emit = defineEmits<{
    (e: "update:visible", value: boolean): void;
    (e: "confirm", result: boolean): void;
}>();

const confirm = (result: boolean) => {
    emit("confirm", result);
    emit("update:visible", false);
};

const computedTitle = computed(() => props.title || "Confirmation");
const computedMessage = computed(
    () => props.message || "Are you sure you want to do it?"
);
</script>

<template>
    <v-dialog v-model="props.visible" persistent max-width="400">
        <v-card rounded="lg">
            <v-card-title class="text-h6">
                {{ computedTitle }}
            </v-card-title>

            <v-card-text>
                <span v-html="computedMessage"></span>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#449673" variant="tonal" @click="confirm(true)">
                    {{ "Yes" }}
                </v-btn>
                <v-btn color="red" variant="outlined" @click="confirm(false)">
                    {{ "No" }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
