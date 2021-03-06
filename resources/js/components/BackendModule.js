import DateUtils from "../mixins/DateUtils";
export default {
    mixins:[DateUtils],
    data() {
        return {
            form: {},
            model: {},
        }
    },
    props: {
        "tableId": {
            required: true,
            type: String,
            default: 'dt'
        },
        "appUrl": {
            required: true,
            type: String
        },
        "apiRoute": {
            required: true,
            type: String
        },
        "tenant": {
            required:false,
            type: String,
            default: null
        },
        "tenantHeaderName": {
            required:false,
            default: null
        },
        "tenantQueryParam": {
            required:false,
            default: null
        },
        "formDialogRef": {
            required: true,
            type: String,
            default: "formDialog"
        },
        "detailsDialogRef": {
            required: true,
            type: String,
            default: "detailsDialog"
        },
        "deleteDialogRef": {
            required: true,
            type: String,
            default: "deleteDialog"
        }
    },
    mounted() {
        const vm = this;
        vm.form = vm.model;
        vm.form.api_route = vm.apiRoute
        axios.defaults.baseURL = this.appUrl;
        if (vm.tenant) {
            if (vm.tenantHeaderName) {
                axios.defaults.headers.common[vm.tenantHeaderName] = vm.tenant;
            } else {
                axios.defaults.params[vm.tenantQueryParam] = vm.tenant;
            }
        }
    },
    methods: {
        validateState(ref) {
            if (
                this.fields[ref] &&
                (this.fields[ref].dirty || this.fields[ref].validated)
            ) {
                return !this.errors.has(ref);
            }
            return null;
        },
        // Reset form
        resetForm() {
            this.form = {
                ...this.model,
                api_route: this.apiRoute
            };
            this.$nextTick(() => {
                this.$validator.reset();
            });
        },
        /**
         * Show create or edit form
         * @param e
         */
        showFormDialog(e) {
            let vm = this;
            if (!e) {
                vm.resetForm();
                vm.$nextTick(function() {
                    vm.$refs[vm.formDialogRef].show();
                })
            } else {
                vm.fetchModel(e.id).then(res => {
                    vm.$refs[vm.formDialogRef].show();
                }).catch(err => {
                    vm.$snotify.error(err.response?.data?.message || err.message || err);
                })
            }
        },
        /**
         * Either create or update the model using the same form
         * @param e
         * @returns {Promise<unknown>}
         */
        onFormSubmit(e) {
            let vm = this;
            let method = "post";
            let url = vm.form.api_route;
            if (vm.form.id) {
                method = "put";
                url = `${vm.form.api_route}/${vm.form.id}`
            }
            vm.submitForm(e,url,method).then(res => {
                vm.$refs[vm.formDialogRef].hide();
            }).finally(res => {
            });
        },
        deleteItem(e) {
            const vm = this;
            let method = "delete";
            let url = `${vm.form.api_route}/${vm.form.id}`
            vm.submitForm(e,url,method).then(res => {
                vm.$refs[vm.deleteDialogRef].hide();
            });
        },
        /**
         *
         * @param e
         * @param url
         * @param method | post, put or delete
         * @returns {Promise<unknown>}
         */
        async submitForm(e, url,method='post') {
            let vm = this;
            return new Promise((resolve, reject) => {
                vm.$validator.validateAll().then(valid => {
                    if (!valid) {
                        reject("The form contains invalid fields")
                        return;
                    }
                    vm.showLoader();
                    axios.request({
                        method: method,
                        url: url,
                        data: vm.form,
                    }).then(res => {
                        vm.$snotify.success(res.data.message);
                        vm.issueGlobalDtUpdateEvent(vm.tableId);
                        resolve(res.data);
                    }).catch(err => {
                        vm.$setErrorsFromResponse(err.response?.data);
                        vm.$snotify.error(err.response?.data?.message || err.message || err)
                        reject(err);
                    }).finally(res => {
                        vm.hideLoader();
                    })
                })
            })
        },
        showDetailsDialog(e) {
            let vm = this;
            vm.fetchModel(e.id).then(res => {
                vm.$refs[vm.detailsDialogRef].show();
            }).catch(err => {
                vm.$snotify.error(err.message || err);
            })
        },
        showDeleteDialog(e) {
            let vm = this;
            vm.fetchModel(e.id).then(res => {
                vm.$refs[vm.deleteDialogRef].show();
            }).catch(err => {
                vm.$snotify.error(err.message || err);
            })
        },

        async fetchModel(id, params=null) {
            const vm = this;
            return new Promise((resolve, reject) => {
                vm.showLoader();
                axios.get(`${vm.form.api_route}/${id}`,{
                    params: params||{}
                }).then(res => {
                    vm.form = {...res.data.payload}
                    resolve(res.data);
                }).catch(err => {
                    reject(err);
                }).finally(res => {
                    vm.hideLoader();
                })
            })
        },
        issueGlobalDtUpdateEvent(tableId) {
            this.$root.$emit("refresh-dt", {
                tableId: tableId
            })
        },
        showLoader() {
            $('#preloader-active').show();
        },
        hideLoader() {
            $('#preloader-active').fadeOut('slow');
        }

    }
}
