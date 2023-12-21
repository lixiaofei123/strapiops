<template>
    <div>
        <el-select v-model="value" :placeholder="'请选择' + ralation_name" @change="selectItem">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
        </el-select>
        <div v-if="selects.length > 0">
            <!-- <div class="sortitem" v-for="item in selects" v-bind:key="item.label"
                v-dragging="{ item: item, list: selects, group: 'item' }">
                <i class="icon-close el-icon-close" @click="deleteItem(item)"></i>
                {{ item.label }}
            </div> -->
            <el-tag v-for="item in selects" :key="item.label" closable type="info" v-dragging="{ item: item, list: selects, group: attrbute_name }" @close="deleteItem(item)">
                {{ item.label }}
            </el-tag>

        </div>


    </div>
</template>
  
<script>
import { deepCopy } from "../../utils/utils"
import { get_ralation_list, get_ralation_list_by_id } from "../../api/api";

export default {
    name: "RalationSelect",
    model: {
        peop: "steps",
        event: 'change'
    },
    props: {
        attributes: Object,
        metadata: Object,
        attrbute_name: String,
        disabled: Boolean,
        entityId: Number,
        model: String,
        content_id: Number,
        steps: Object
    },
    data() {
        return {
            options: [

            ],
            value: "",
            ralation_name: "",
            selects: [

            ],
            initSelects: [

            ],
        };
    },
    mounted() {
        this.ralation_name = this.metadata.label
        this.init(this.content_id)
        this.$dragging.$on('dragged', ({ value }) => {
        })
        this.$dragging.$on('dragend', () => {

        })
    },
    watch: {
        selects() {
            let disconnect = []
            let connect = []

            for (let i = 0; i < this.initSelects.length; i++) {
                let find = this.selects.findIndex(x => x.value === this.initSelects[i].value)
                if (find === -1) {
                    disconnect.push({
                        id: this.initSelects[i].value
                    })
                }
            }
            for (let i = this.selects.length - 1; i >= 0; i--) {
                if (i === this.selects.length - 1) {
                    connect.push({
                        id: this.selects[i].value,
                        position: { end: true }
                    })
                } else {
                    connect.push({
                        id: this.selects[i].value,
                        position: { before: this.selects[i + 1].value }
                    })
                }
            }

            let steps = {
                disconnect: disconnect,
                connect: connect
            }

            this.$emit("change", steps);

            //this.$emit("", steps)
        }
    },
    methods: {
        get_info(obj) {
            let keys = Object.keys(obj)
            let main_key_index = keys.findIndex(name => name !== "id" && name !== "publishedAt")
            let need_published = obj["publishedAt"] !== undefined
            let is_published = obj["publishedAt"] !== null
            if (main_key_index !== -1) {
                return {
                    id: obj["id"],
                    label: obj[keys[main_key_index]],
                    need_published: need_published,
                    is_published: is_published,
                    value: obj["id"]
                }
            } else {
                return {
                    id: obj["id"],
                    label: obj["id"],
                    need_published: need_published,
                    is_published: is_published,
                    value: obj["id"]
                }
            }
        },
        init(content_id) {
            get_ralation_list(this.model, this.attrbute_name, content_id, 1, 20, data => {
                let results = data.results
                if (results.length > 0) {
                    let items = results.map(item => {
                        return this.get_info(item)
                    })
                    this.options = items
                }

                if (content_id) {
                    get_ralation_list_by_id(this.model, this.attrbute_name, content_id, 1, 20, data => {

                        if (this.attributes.relation === "manyToMany") {
                            let results = data.results
                            let initSelects = []
                            for (let i = results.length - 1; i >= 0; i--) {
                                initSelects.push(this.get_info(results[i]))
                            }

                            this.initSelects = deepCopy(initSelects)
                            this.selects = deepCopy(initSelects)
                        }

                        if (this.attributes.relation === "manyToOne") {
                            let data1 = data.data
                            let initSelects = [
                                this.get_info(data1)
                            ]
                            this.initSelects = deepCopy(initSelects)
                            this.selects = deepCopy(initSelects)

                        }

                    })
                }
            })
        },
        selectItem(item) {
            let selectIndex = this.options.findIndex(x => x.value === item)
            if (selectIndex !== -1) {
                if (this.attributes.relation === "manyToMany") {
                    let selectItem = this.options.splice(selectIndex, 1)
                    this.selects.push(selectItem[0])
                }
                if (this.attributes.relation === "manyToOne") {
                    if (this.selects.length === 0) {
                        let selectItem = this.options.splice(selectIndex, 1)
                        this.selects.push(selectItem[0])
                    } else {
                        let selectItem = this.options.splice(selectIndex, 1)

                        let oldItem = this.selects.splice(0, 1)
                        this.options.push(oldItem[0])
                        this.selects.push(selectItem[0])
                    }

                }


            }
        },
        deleteItem(item) {
            let selectIndex = this.selects.findIndex(x => x.value === item.value)
            if (selectIndex !== -1) {
                let selectItem = this.selects.splice(selectIndex, 1)
                this.options.push(selectItem[0])

            }
        }
    },
    computed: {

    },
};
</script>
  
<style scoped>
.sortitem {
    width: 210px;
    height: 50px;
    padding: 10px;
    border: 1px solid #E4E7ED;
    background: white;
    line-height: 30px;
    margin: 5px;
    border-radius: 4px;
    cursor: pointer;

}

.sortitem-text {
    width: 130px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    margin-right: 15px;
}

.deletebtn {
    width: 30px;
    height: 30px;
    margin-top: -20px;
}

.icon-close {
    color: #f56c6c
}

/deep/ .el-tag {
    margin-right: 10px;
}
</style>