<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axiosInstance from "@/services/axiosInstance";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string;
}

const router = useRouter();

const headers = [
    { key: "avatar", align: "start" as const, width: "100px", sortable: false },
    { title: "Full Name", key: "full_name", sortable: false },
    { title: "Action", key: "actions", align: "end" as const, sortable: false },
];

const search = ref<string>("");

const itemsPerPage = ref<number>(8);
const currentPage = ref<number>(1);
const total = ref<number>(0);
const totalPages = ref<number>(0);

const users = ref<User[]>([]);
const loading = ref<boolean>(false);

const snackbar = ref<boolean>(false);
const message = ref<string>("");
const timeout = ref<number>(2500);

const confirmationModal = ref<boolean>(false);
const confirmationModalMetadata = ref<User | null>(null);

const computedUsers = computed(() => {
    const searchLower = search.value.toLowerCase();
    return users.value
        .map((user: User) => ({
            ...user,
            full_name: `${user.first_name} ${user.last_name}`,
        }))
        .filter((user) => user.full_name.toLowerCase().includes(searchLower));
});

const loadUsers = async () => {
    loading.value = true;

    try {
        const { data, status } = await axiosInstance.get("/api/users", {
            params: {
                page: currentPage.value,
                per_page: itemsPerPage.value,
            },
        });

        if (status === 200) {
            users.value = data.data as User[];

            total.value = data.total;
            totalPages.value = data.total_pages;
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const deleteUser = async (id: number, fullName: string, lastName: string) => {
    try {
        const { status } = await axiosInstance.delete(`api/users/${id}`);

        if (status === 204) {
            message.value = `User ${fullName} ${lastName} successfully deleted`;
            snackbar.value = true;

            await loadUsers();
        }
    } catch (err) {
        console.error(err);
    }
};

const handleConfirmation = async (confirmed: boolean) => {
    if (confirmed && confirmationModalMetadata.value) {
        const { id, first_name, last_name } = confirmationModalMetadata.value;

        await deleteUser(id, first_name, last_name);
        confirmationModalMetadata.value = null;
    }
};

const updatePage = (page: number) => {
    currentPage.value = page;
};

const getRowStyle = (item: any) => {
    return item.index % 2 === 0
        ? { style: "background: #f4f7f8" }
        : { style: "background: white" };
};
</script>

<template>
    <ConfirmationModal
        :visible="confirmationModal"
        @update:visible="confirmationModal = $event"
        @confirm="handleConfirmation"
    />

    <v-container class="mt-16">
        <v-row class="mx-16">
            <v-col cols="2" class="mb-2 ml-1">
                <p class="text-h3 text-title">User list</p>
            </v-col>

            <v-responsive width="100%"></v-responsive>

            <v-col cols="12">
                <v-card
                    color="#ffffff"
                    class="pa-4"
                    height="600"
                    :elevation="3"
                >
                    <v-row>
                        <v-col cols="6">
                            <v-text-field
                                variant="solo"
                                v-model="search"
                                label="Search for users..."
                                append-inner-icon="mdi-magnify"
                                density="compact"
                                single-line
                                hide-details
                                class="mb-4 w-50 font-weight-bold"
                                bg-color="#f9f9fb"
                                flat
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="text-right">
                            <v-btn
                                class="text-subtitle-1"
                                color="#449772"
                                rounded="xl"
                                height="43"
                                prepend-icon="mdi-plus"
                                flat
                                @click="router.push('/add')"
                            >
                                Add User
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-data-table-server
                        v-model:items-per-page="itemsPerPage"
                        :page.sync="currentPage"
                        :row-props="getRowStyle"
                        :headers="headers"
                        :items="computedUsers"
                        :items-length="total"
                        :loading="loading"
                        :hide-default-footer="true"
                        @update:options="loadUsers"
                        @update:page="updatePage"
                    >
                        <template v-slot:item.avatar="{ item }">
                            <v-avatar size="38">
                                <img
                                    :src="item.avatar"
                                    width="38"
                                    height="38"
                                    rounded="100%"
                                />
                            </v-avatar>
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-icon
                                small
                                class="cursor-pointer"
                                color="#aeb4ba"
                                @click="
                                    router.push({
                                        name: 'edit-user',
                                        params: { id: item.id },
                                        query: {
                                            firstname: item.first_name,
                                            lastname: item.last_name,
                                            avatar: item.avatar,
                                        },
                                    })
                                "
                            >
                                mdi-square-edit-outline
                            </v-icon>
                            <v-icon
                                small
                                class="ml-2 cursor-pointer"
                                color="#aeb4ba"
                                @click="
                                    (confirmationModalMetadata = item),
                                        (confirmationModal = true)
                                "
                            >
                                mdi-delete
                            </v-icon>
                        </template>
                    </v-data-table-server>
                </v-card>

                <v-pagination
                    class="mt-5"
                    v-model="currentPage"
                    :length="totalPages"
                    active-color="#449673"
                    variant="flat"
                    rounded="sm"
                    density="comfortable"
                    next-icon="mdi-chevron-double-right"
                    prev-icon="mdi-chevron-double-left"
                />
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

<style scoped lang="scss">
:deep(.v-pagination__list) {
    justify-content: start;

    > * {
        margin: 0;
        border: 1px solid #edeef1;
        border-right: none;
        border-radius: 2px;

        &:last-child {
            border-right: 1px solid #edeef1;
        }
    }
}

:deep(.v-table) {
    .v-table__wrapper > table {
        tbody {
            tr:not(:last-child) > td {
                border-bottom: none;
            }
        }

        thead {
            tr > th {
                border: none;
            }
        }
    }
}
</style>
