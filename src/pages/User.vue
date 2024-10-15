<script lang="ts" setup>
import { ref, computed, defineProps } from "vue";
import { useRoute } from "vue-router";
import axiosInstance from "@/services/axiosInstance";

const props = defineProps<{
    firstname?: string;
    lastname?: string;
    avatar?: string;
}>();

const route = useRoute();

const isEditMode = computed(() => {
    return route.name === "edit-user";
});

const userForm = ref();
const firstname = ref<string | null>(props.firstname || null);
const lastname = ref<string | null>(props.lastname || null);

const imageInput = ref();
const selectedImage = ref<string | null>(props.avatar || null);
const selectedFile = ref<File | null>(null);

const loading = ref<boolean>(false);

const snackbar = ref<boolean>(false);
const message = ref<string>("");
const timeout = ref<number>(2500);

const requiredRule = (value: string) => !!value || "This field is required";

const resetForm = () => {
    firstname.value = null;
    lastname.value = null;
    selectedImage.value = null;
    selectedFile.value = null;
};

const addUser = async () => {
    loading.value = true;

    try {
        const { status } = await axiosInstance.post("/api/users", {
            first_name: firstname.value,
            last_name: lastname.value,
            avatar: "https://reqres.in/img/faces/1-image.jpg",
        });

        if (status === 201) {
            message.value = `User ${firstname.value} ${lastname.value} has been successfully added`;
            snackbar.value = true;

            resetForm();
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const updateUser = async () => {
    loading.value = true;

    try {
        const { status } = await axiosInstance.put(
            `/api/users/${route.params.id}`,
            {
                first_name: firstname.value,
                last_name: lastname.value,
                avatar: "https://reqres.in/img/faces/1-image.jpg",
            }
        );

        if (status === 200) {
            message.value = `User ${firstname.value} ${lastname.value} has been successfully edited`;
            snackbar.value = true;
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const authenticateForm = async () => {
    const isFormValid = await userForm.value.validate();

    if (isFormValid.valid) {
        isEditMode.value ? await updateUser() : await addUser();
    } else {
        loading.value = false;
    }
};

const handleFileChange = (event: Event) => {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
        selectedFile.value = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            selectedImage.value = e.target?.result as string;
        };

        reader.readAsDataURL(selectedFile.value);
    }
};
</script>

<template>
    <v-container class="mt-16">
        <v-row class="mx-16">
            <v-col cols="2" class="mb-2 ml-1">
                <p class="text-h3 text-title">
                    {{ isEditMode ? "Edit user" : "Add user" }}
                </p>
            </v-col>

            <v-responsive width="100%"></v-responsive>

            <v-col cols="8">
                <v-card
                    color="#ffffff"
                    class="pa-4"
                    height="350"
                    :elevation="3"
                >
                    <v-form
                        ref="userForm"
                        @submit.prevent="authenticateForm"
                        class="d-flex flex-column fill-height"
                    >
                        <v-card-item class="mt-11">
                            <v-row>
                                <v-col cols="6">
                                    <p class="text-subtitle-2 mb-1">
                                        First Name
                                    </p>
                                    <v-text-field
                                        v-model="firstname"
                                        variant="outlined"
                                        placeholder="Type your first name"
                                        density="compact"
                                        :rules="[requiredRule]"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <p class="text-subtitle-2 mb-1">
                                        Last Name
                                    </p>
                                    <v-text-field
                                        v-model="lastname"
                                        variant="outlined"
                                        placeholder="Type your last name"
                                        density="compact"
                                        :rules="[requiredRule]"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card-item>
                        <v-card-actions class="mt-auto">
                            <v-btn
                                type="submit"
                                variant="flat"
                                class="text-subtitle-1 px-5 ml-2 font-weight-regular"
                                height="40"
                                color="#449772"
                                :loading="loading"
                            >
                                {{ isEditMode ? "Update details" : "Add user" }}
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card
                    color="#ffffff"
                    class="d-flex flex-column pa-4"
                    height="350"
                    :elevation="3"
                >
                    <v-avatar
                        class="mx-auto mt-11 pa-1 border-sm"
                        color="#f3f6f9"
                        size="150"
                    >
                        <v-img
                            :src="selectedImage"
                            cover
                            rounded="circle"
                            v-if="selectedImage"
                        ></v-img>
                        <v-img
                            src="../assets/default.jpg"
                            cover
                            rounded="circle"
                            v-else
                        ></v-img>
                    </v-avatar>

                    <v-card-actions class="mt-auto">
                        <v-btn
                            width="100%"
                            class="text-subtitle-1 font-weight-regular"
                            variant="outlined"
                            color="#707479"
                            prepend-icon="mdi-camera"
                            @click="imageInput.click()"
                        >
                            Change Photo
                        </v-btn>
                        <v-file-input
                            ref="imageInput"
                            @change="handleFileChange"
                            accept="image/*"
                            style="display: none"
                        ></v-file-input>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <v-snackbar v-model="snackbar" :timeout="timeout" color="#449673">
            {{ message }}

            <template v-slot:actions>
                <v-btn color="#A7FFEB" variant="text" @click="snackbar = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>
