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
                    <img class="image" v-if="item[field.key].type === 'image'" :src="item[field.key].data" />
                    <span v-if="item[field.key].type === 'string'">{{ item[field.key].data }}</span>
                    <div v-if="item[field.key].type === 'array'">
                        <div v-for="(item, index) in item[field.key].data" v-bind:key="index"
                            style="float: left;margin-right: 10px;">
                            <img class="image" v-if="item.type === 'image'" :src="item.data" />
                            <span v-if="item.type === 'string'">{{ item.data }}</span>
                        </div>
                    </div>
                    <div v-if="item[field.key].type === 'boolean'">
                        <el-switch v-model="item[field.key].data" active-color="#13ce66" inactive-color="#ff4949" 
                            @change="event=>bool_value_changed(item, field.key, event)">
                        </el-switch>
                    </div>
                </td>
                <td>
                    <div>
                        <CRow class="align-items-center remove-padding">
                            <CCol col="6">
                                <CButton block color="secondary" size="sm" @click="$emit('editContent', item.id.data)">编辑
                                </CButton>
                            </CCol>
                            <CCol col="6">
                                <CButton block color="danger" size="sm" @click="$emit('deleteContent', item.id.data)">删除
                                </CButton>
                            </CCol>
                        </CRow>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>
  
<script>
export default {
    name: "ContentTable",
    props: {
        items: Array,
        fields: Array
    },
    data() {
        return {
        };
    },
    methods: {
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