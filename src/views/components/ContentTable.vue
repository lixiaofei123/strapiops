<template>
    <table>
        <thead>
            <td v-for="field in fields" v-bind:key="field.key">
                {{ field.label }}
            </td>
            <td style="width: 250px;">
                操作
            </td>
        </thead>
        <tbody>
            <tr v-for="item in items" v-bind:key="item.id.data">
                <td v-for="field in fields" v-bind:key="field.key">
                    <el-image fit="contain" class="image" v-if="item[field.key].type === 'image'" :src="item[field.key].data" 
                        :preview-src-list="[getAbsoluteUrl(item[field.key].url)]" />
                    <span v-if="item[field.key].type === 'string'">{{ item[field.key].data }}</span>
                    <div v-if="item[field.key].type === 'array'">
                        <div v-for="(item, index) in item[field.key].data" v-bind:key="index"
                            style="float: left;margin-right: 10px;">
                            <img class="image" v-if="item.type === 'image'" :src="item.data" />
                            <span v-if="item.type === 'string'">{{ item.data }}</span>
                        </div>
                    </div>
                    <div v-if="item[field.key].type === 'boolean'">
                        <i v-if="!item[field.key].can_update && item[field.key].data"  class="el-icon-success" 
                            style="color:#67C23A;font-size:25px"></i>
                        <i v-if="!item[field.key].can_update && !item[field.key].data" class="el-icon-error" 
                            style="color:#E6A23C;font-size:25px"></i>
                        <el-switch  v-if="item[field.key].can_update" v-model="item[field.key].data" 
                            active-color="#13ce66" inactive-color="#ff4949" 
                            @change="event=>bool_value_changed(item, field.key, event)">
                        </el-switch>
                    </div>
                </td>
                <td>
                    <div>
                        <CRow class="align-items-center remove-padding">
                            <CCol :col="permission.delete ? 6 : 12">
                                <el-button  v-if="permission.update" block type="info"  size="small" @click="$emit('editContent', item.id.data)">编辑
                                </el-button>
                                <el-button  v-else block type="primary"  size="small" @click="$emit('editContent', item.id.data)">查看
                                </el-button>
                            </CCol>
                            <CCol col="6" v-if="permission.delete">
                                <el-button block type="danger"  size="small" @click="$emit('deleteContent', item.id.data)">删除
                                </el-button>
                            </CCol>
                        </CRow>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>
  
<script>
import { getAbsoluteUrl } from "../../utils/utils.js";
export default {
    name: "ContentTable",
    props: {
        items: Array,
        fields: Array,
        permission: Object
    },
    data() {
        return {
        };
    },
    methods: {
        getAbsoluteUrl(url){
            return getAbsoluteUrl(url)
        },
        bool_value_changed(item, attrname,newvalue){
            this.$emit("bool_value_changed", item, attrname,newvalue)
        }
    },
};
</script>
  
<style scoped>
.remove-padding {
    margin-left: 0px;
    margin-right: 0px;
}

.image {
    width: 50px;
    height: 50px;
}

table {
    width: 100%;
    padding: 20px;
    margin-bottom: 50px;
}

td {
    padding: 10px 20px;
    border-bottom: 2px solid #f2f2f2;
    text-align: center;
}

tr {
    cursor: pointer;
}

tr:hover {
    background: #f2f2f2;
}
</style>